//Import dotenv and configure it
import * as dotenv from "dotenv";
dotenv.config();
//Setup Server
import express from "express";
import { createServer, ServerResponse } from "http";
const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 4300;

//Security Middlewares
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
//EJS Rendering
import ejs from "ejs";
import ejsLayout from "express-ejs-layouts";

//Import Socket.io
const io = require("socket.io")(httpServer, {
  cors: {
    origin: `http://localhost:${PORT}`,
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  },
});
//Initialize middlewares and security
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(ejsLayout);
import path from "path";
app.use("/static", express.static(path.join(__dirname, "public")));
app.disable("x-powered-by");
app.use(helmet());
app.use(
  cors({
    origin: "*",
    credentials: true,
    exposedHeaders: ["set-cookie"],
    methods: ["GET", "PATCH", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(compression());

import session from "express-session";
import cookieParser from "cookie-parser";
import sharedSession from "express-socket.io-session";
const sessionMiddleware = session({
  name: "burgerito_bot.sid",
  secret: process.env.SESSION_SECRET as string,
  resave: true,
  saveUninitialized: true,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, // 1 day
    secure: false, // set to true if using HTTPS
    httpOnly: true, // prevents client side JavaScript from accessing the cookie
  },
});
import { Socket } from "socket.io";
import { Request } from "express";
app.use(cookieParser());
app.use(sessionMiddleware);
io.use((socket: Socket, next: (err?: any) => void) => {
  sessionMiddleware(
    socket.request as Request,
    //@ts-ignore
    socket.request.res,
    next
  );
});
//Template Engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.set("layout", path.join(__dirname, "/views/layout/main"));

//Logger
import * as expressWinston from "express-winston";
import { log, prodLogger } from "./utils/logger";

import OrderHandler from "./Object/Order";
import { infoEmitter } from "./Object/Order";

// let previousOrderInstance: OrderHandler;
//Socket
io.on("connection", (socket: any) => {
  // const cookieString = socket.handshake.headers.cookie;
  // let order: OrderHandler | null = null;
  // if (cookieString && cookieString.includes("burgerito_bot.sid")) {
  //   order = previousOrderInstance;
  // } else {
  //   order = new OrderHandler();
  //   previousOrderInstance = order;
  // }
  let order = new OrderHandler();
  socket.request.session.userId = socket.id; // Save the session data to the user's browser cookie
  socket.request.session.save((err: any) => {
    if (err) {
      console.error("Error saving session data:", err);
    }
  });

  socket.on("userConnection", (username: string) => {
    prodLogger.info("User:" + " " + socket.id);
    socket.emit("infoMessage", {
      message: `${username}, welcome to Burgerito Chatbot`,
      option: [],
    });
    socket.emit("botMessage", {
      message: order!.introMessage().message,
      options: [1, 99, 98, 97, 0],
    });
  });
  // function updateOrderStatus(data: object) {
  //   //@ts-ignore
  //   socket.emit("infoMessage", { message: data.message, option: [] });
  // }
  // infoEmitter.on("message", updateOrderStatus);
  socket.on("userMessage", (message: any) => {
    switch (message) {
      case 1:
        socket.emit("botMessage", {
          message: order!.listOrderItems().message,
          options: [20, 21, 22, 23, 24, 29, 100, 101],
        });
        break;
      case 99:
        socket.emit("botMessage", {
          message: order!.checkoutOrder().message,
          options: [1, 98, 97, 100, 101],
        });
        break;
      case 98:
        socket.emit("botMessage", {
          message: order!.viewOrderHistory().message,
          options: [1, 100, 101],
        });
        break;
      case 97:
        socket.emit("botMessage", {
          message: order!.viewCurrentOrder().message,
          options: [1, 99, 0, 100, 101],
        });
        break;
      case 0:
        socket.emit("botMessage", {
          message: order!.cancelOrder().message,
          options: [1, 100, 101],
        });
        break;
      case 29:
        socket.emit("botMessage", {
          message: order!.listComboItems().message,
          options: [30, 31, 32, 33, 34, 35, 36, 37, 38, 100, 101],
        });
        break;
      case 101:
        socket.emit("botMessage", {
          message: order!.introMessage().message,
          options: [1, 99, 98, 97, 0],
        });
        break;
      case 404:
        socket.emit("botMessage", {
          message: `<h4 style="color:red">Invalid Entry</h4><br><small><li>Select or type <strong style="color:#ff0">100</strong> to go to previous menu</li><li>Select or type <strong style="color:#ff0">101</strong> to go back to main menu</li></small>`,
          options: [100, 101],
        });
        break;
      default:
        socket.emit("botMessage", {
          message: order!.makeAnOrder(message).message,
          options: [1, 99, 97, 100, 101],
        });
        break;
    }
  });
});

//Chat Application
app.get("/", (req, res) => {
  res.render("chat");
});

app.use(
  expressWinston.logger({
    winstonInstance: prodLogger,
    statusLevels: true,
  })
);
app.use(log);
//Start Server
const start = async () => {
  //Start Server
  const server = httpServer.listen(PORT, () => {
    prodLogger.info(`Server is listening on port ${PORT}`);
  });
  //Server Error
  server.on("error", (error: Error) => {
    prodLogger.error(
      `An error while tring to starting server: ${error.message}`
    );
    process.exit(1);
  });
};
start();
export { io };
