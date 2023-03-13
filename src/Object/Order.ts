import { io } from "..";
interface Item {
  name: string;
  price: number;
  code?: number;
  quantity?: number;
}
interface Option {
  optionNumber: number;
  optionMessage: string;
}
interface InfoOption {
  message: string;
}
interface OrderOptions {
  orderCode: number;
  orderItems: string[];
  orderStatus:
    | "preparing"
    | "ready for delivery"
    | "On its way"
    | "delivered"
    | "cancelled";
  price: number;
}
let processTime: number = 60;
export default class OrderHandler {
  private introOptions: Option[] = [
    { optionNumber: 1, optionMessage: "Place an order" },
    { optionNumber: 99, optionMessage: "Checkout order" },
    { optionNumber: 98, optionMessage: "See order history" },
    { optionNumber: 97, optionMessage: "See current order" },
    { optionNumber: 0, optionMessage: "cancel order" },
  ];
  private orderItems: Item[] = [
    { name: "Burger", price: 2500, code: 20 },
    { name: "Burito", price: 1500, code: 21 },
    { name: "Small Chops", price: 1500, code: 22 },
    { name: "Chicken & Chips", price: 2000, code: 23 },
    { name: "Coca Cola", price: 500, code: 24 },
  ];
  private comboItems: Item[] = [
    { name: "Burito, Coca Cola", price: 1900, code: 30 },
    { name: "Burito, Chicken & Chips, Coca Cola", price: 3800, code: 31 },
    { name: "Burito, Small Chops, Coca Cola", price: 3325, code: 32 },
    { name: "Burger, Coca Cola", price: 2850, code: 33 },
    { name: "Burger, Burito, Coca Cola", price: 4275, code: 34 },
    { name: "Burger, Chicken & Chips, Coca Cola", price: 4750, code: 35 },
    { name: "Small Chops, Coca Cola", price: 1900, code: 36 },
    { name: "Small Chops, Chicken & Chips, Coca Cola", price: 3800, code: 37 },
    {
      name: "Burito, Burger, Small Chops, Chicken & Chips, Coca Cola",
      price: 10,
      code: 38,
    },
  ];
  private selectItems: Item[] = [];
  private currentOrder: OrderOptions[] = [];
  private orderHistory: OrderOptions[] = [];
  private totalPrice: number = 0;
  private reverseInfo: string = `<small><em>Select or type <strong style="color: #ff0;">100</strong> to go to previous menu or <strong style="color: #ff0;">101</strong> to go to main menu</em><small>`;
  public introMessage(): InfoOption {
    const infoMessage = this.introOptions
      .map((option) => {
        return `<small><li>Select or type <strong style="color: #ff0;">${option.optionNumber}</strong> to ${option.optionMessage}</li></small>`;
      })
      .join("");
    return {
      message: `<h3>Welcome to Burgerito Chops, below are a list of options to navigate you through.</h3><br> 
        ${infoMessage}`,
    };
  }
  public listOrderItems(): InfoOption {
    const itemsHTML = this.orderItems
      .map((item) => {
        return `<small><li>Select or type <strong style="color: #ff0;">${item.code}</strong> to order ${item.name}: &#8358;${item.price}</li></small>`;
      })
      .join("");
    return {
      message: `<h3>Burgerito Order Menu</h3><br>
        ${itemsHTML}
        <small><li>Select or type <strong style="color: #ff0;">29</strong> to check Combo Packages</li></small> ${this.reverseInfo}`,
    };
  }

  public listComboItems(): InfoOption {
    let comboOptions: number[] = [100, 101];
    const combosHTML = this.comboItems
      .map((item) => {
        comboOptions.push(item.code as number);
        return `<small><li>Select or type <strong style="color: #ff0;">${item.code}</strong> to order ${item.name}: &#8358;${item.price}</li></small>`;
      })
      .join("");
    return {
      message: `<h3>Burgerito Combo Menu</h3><br>
        ${combosHTML}
        ${this.reverseInfo}`,
    };
  }
  public makeAnOrder(itemNumber: number): InfoOption {
    const item =
      this.orderItems.find((item) => item.code === itemNumber) ||
      this.comboItems.find((item) => item.code === itemNumber);
    let message: string;
    if (!item) {
      message = `<h4>Item not found</h4><br>`;
    } else {
      const index = this.selectItems.find(
        (selectedItem) => selectedItem.code === item.code
      );
      if (index) {
        //@ts-ignore
        index.quantity += 1;
        message = `<h4>Item order quantity has been increased</h4><br>`;
      } else {
        item.quantity = 1;
        this.selectItems.push(item);
        message = `<h4>Item added to selcted item for order</h4><br>`;
      }
    }
    let addedItem = <Item>(
      this.selectItems.find((selectItem) => selectItem.code === itemNumber)
    );
    const rows = `
        <tr>
          <td style="border: 2px solid yellow;">${addedItem.name}</td>
          <td style="border: 2px solid yellow;">${addedItem.price}</td>
          <td style="border: 2px solid yellow;">${addedItem.quantity}</td>
        </tr>
      `;
    const table = `
      <table style="border-collapse: collapse; width: 100%; border: 2px solid yellow;">
        <thead>
          <tr>
            <th style="border: 2px solid yellow;">Name</th>
            <th style="border: 2px solid yellow;">Price</th>
            <th style="border: 2px solid yellow;">Quantity</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    `;
    let optionMessage = `<br><small><li>Select or type <strong style="color: #ff0;">1</strong> to select more items</li><li>Select or type <strong style="color: #ff0;">99</strong> to proceed to checkout</li><li>Select or type <strong style="color: #ff0;">97</strong> to see current orders</li></small>${this.reverseInfo}`;
    return {
      message: `${message}
        <div class="table-container">${table}</div>
        <br>${optionMessage}`,
    };
  }

  public checkoutOrder(): InfoOption {
    let optionMessage = `<br><small><li>Select or type <strong style="color: #ff0;">1</strong> to place a new order</li><li>Select or type <strong style="color: #ff0;">98</strong> to see order history</li><li>Select or type <strong style="color: #ff0;">97</strong> to check for any current order</li></small>${this.reverseInfo}`;
    if (!this.selectItems.length) {
      return { message: `<h4>No order to place</h4>${optionMessage}` };
    }
    const items: string[] = [];
    let totalPrice = 0;
    this.selectItems.forEach((item) => {
      const itemPrice = item.price * <number>item.quantity;
      items.push(item.name);
      totalPrice += itemPrice;
    });
    const lastOrderCode = this.orderHistory.length
      ? this.orderHistory[this.orderHistory.length - 1].orderCode
      : Math.floor(Math.random() * 100000);
    const orderObject: OrderOptions = {
      orderCode: lastOrderCode + 1,
      orderItems: items,
      orderStatus: "preparing",
      price: totalPrice,
    };
    this.selectItems = [];
    this.orderHistory.push(orderObject);
    this.updateOrderStatus(orderObject.orderCode);
    return { message: `<h4>Order placed</h4> ${optionMessage}` };
  }

  private updateOrderStatus(orderNum: number): void {
    let order = this.orderHistory.find((order) => order.orderCode === orderNum);
    // update the status
    if (order?.orderStatus === "preparing") {
      setTimeout(() => {
        io.emit("infoMessage", {
          message: `Order ${orderNum} is preparing`,
        });
      }, 3000);
      setTimeout(() => {
        order!.orderStatus = "ready for delivery";
        io.emit("infoMessage", {
          message: `Order ${orderNum} ready for delivery`,
          option: [],
        });
        this.updateOrderStatus(orderNum);
      }, 60000);
    } else if (order?.orderStatus === "ready for delivery") {
      setTimeout(() => {
        order!.orderStatus = "On its way";
        io.emit("infoMessage", {
          message: `Order ${orderNum} is on its way`,
          option: [],
        });
        this.updateOrderStatus(orderNum);
      }, 60000);
    } else if (order!.orderStatus === "On its way") {
      setTimeout(() => {
        order!.orderStatus = "delivered";
        io.emit("infoMessage", {
          message: `Order ${orderNum} has been delivered. Thank you for you patronage`,
          option: [],
        });
      }, 60000);
    }
  }

  public viewOrderHistory(): InfoOption {
    let optionMessage = `<br><small><li>Select or type <strong style="color: #ff0;">1</strong> to place a new order</li></small>${this.reverseInfo}`;
    if (this.orderHistory.length === 0) {
      return { message: `<h4>You have no order yet</h4> ${optionMessage}` };
    }
    const headerCells = ["Order No.", "Products", "Price", "Status"];
    const headerRow = `<tr>${headerCells
      .map((cell) => `<th style = "border: 2px solid #ff0">${cell}</th>`)
      .join("")}</tr>`;
    const rows = this.orderHistory
      .map((order) => {
        return `
        <tr>
          <td style = "border: 2px solid #ff0">${order.orderCode}</td>
          <td style = "border: 2px solid #ff0">${order.orderItems}</td>
          <td style = "border: 2px solid #ff0">${order.price}</td>
          <td style = "border: 2px solid #ff0">${order.orderStatus}</td>
        </tr>
      `;
      })
      .join("");

    const table = `<div class="table-container">
      <table style="border-collapse: collapse; width: 100%; border: 2px solid yellow;">
        <thead>${headerRow}</thead>
        <tbody>${rows}</tbody>
      </table></div><br>
    `;

    return { message: `<h4>Your order history</h4>${table} ${optionMessage}` };
  }

  public viewCurrentOrder(): InfoOption {
    let optionMessage = `<br><small><li>Select or type <strong style="color: #ff0;">1</strong> to place an order</li><li>Select or type <strong style="color: #ff0;">99</strong> to checkout order</li><li>Select or type <strong style="color: #ff0;">0</strong> to cancel order</li></small>${this.reverseInfo}`;
    if (!this.selectItems.length) {
      return { message: `<h4>There is no current order</h4>${optionMessage}` };
    }
    this.totalPrice = this.selectItems.reduce(
      (total, item) => total + item.price * <number>item.quantity,
      0
    );
    const rows = this.selectItems
      .map(
        (item) => `
        <tr>
          <td style="border: 2px solid yellow;">${item.name}</td>
          <td style="border: 2px solid yellow;">${item.price}</td>
          <td style="border: 2px solid yellow;">${item.quantity}</td>
        </tr>
      `
      )
      .join("");
    const table = `
      <table style="border-collapse: collapse; width: 100%; border: 2px solid yellow;">
        <thead>
          <tr>
            <th style="border: 2px solid yellow;">Name</th>
            <th style="border: 2px solid yellow;">Price</th>
            <th style="border: 2px solid yellow;">Quantity</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    `;
    return {
      message: `<h4>Your current order</h4><br>
        ${table}
        <br> Total Price = <strong>${this.totalPrice}</strong> <br>${optionMessage}`,
    };
  }

  public cancelOrder(): InfoOption {
    let message: string;
    let optionMessage = `<br><small><li>Select or type <strong style="color: #ff0;">1</strong> to place a new order</li></small>${this.reverseInfo}`;
    if (!this.selectItems.length) {
      message = `<h4>No item has been selected yet</h4>${optionMessage}`;
    } else {
      this.selectItems = [];
      message = `<h4>Your placed order has been cancelled</h4>${optionMessage}`;
    }
    return { message };
  }
}
