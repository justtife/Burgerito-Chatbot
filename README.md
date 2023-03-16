# Burgerito-Chatbot
A restaurant chatbot application built using socket.io, ejs, express, typescript
---
## Features
3. When a customer lands on the chatbot page, the bot should send these options to the customer:
Select 1 to Place an order
Select 99 to checkout order
Select 98 to see order history
Select 97 to see current order
Select 0 to cancel order
4. When a customer selects “1”, the bot should return a list of items from the restaurant. The order items can have multiple options but the customer should be able to select the preferred items from the list using this same number select system and place an order.
5. When a customer selects “99” for an order, the bot should respond with “order placed” and if none the bot should respond with “No order to place”. Customer should also see an option to place a new order
6. When a customer selects “98”, the bot should be able to return all placed orders from previous order to present orders and return <kbd>no current order<kbd> if no order has been made yet
7. When a customer selects “97”, the bot should be able to return current selected items and return <kbd>no current order<kbd> if none
8. When a customer selects “0”, the bot should cancel the order if there is.

---
## Setup
- Pull this repo
- In the CLI run npm install to install all node modules.
- Update env with example.env/update.env
- Run `npm run start` on the CLI
---
