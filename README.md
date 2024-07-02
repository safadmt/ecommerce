# eCommerce Project

## Introduction

This is a comprehensive eCommerce application built using modern web technologies. It offers a range of features for both users and administrators to manage products, orders, and other functionalities efficiently.

## Technologies Used

- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Frontend**: EJS Template Engine
- **Payment Gateways**: Stripe, Razorpay

## Features

### User Features

- **Authentication**:
  - User login and signup with email validation (OTP sent to user email)
  - Forgot password functionality

- **Product Management**:
  - Beautiful landing page with men's and women's collections
  - Product listing with filtration and dynamic pagination
  - Search products and view product details
  - Add ratings and reviews

- **Cart and Wishlist**:
  - Guest cart and user cart
  - Add products to wishlist (logged in users)
  - Increment/decrement product quantity in the cart with total price update without page reload
  - Limit of 6 products in each order

- **Checkout and Payment**:
  - Apply coupon discounts if total price exceeds the coupon amount
  - Payment methods: User wallet, Stripe, Razorpay

- **User Profile**:
  - Manage delivery addresses (add, delete, edit, view)
  - Edit personal information (change password, change email with sending OTP, change mobile, )
  - View order history, download invoices, view individual orders
  - Return products within 7 days of delivery
  - Wallet section: View previous transactions and import cash via Razorpay

### Admin Features

- **Dashboard**:
  - Visualize data with Chart.js:
    - Doughnut and pie charts for total income by brand
    - Bar chart for total products sold each month
  - Overview: Total user count, total income, total orders, total sales

- **Product Management**:
  - List, search, add (with front-end validation), edit, and toggle active/inactive status of products
  - Mark products as returnable or non-returnable 


- **Order Management**:
  - filter order by date
  - View, cancel, ship, and deliver orders using order status
  - Manage product returns with statuses:
    - `RETURN_REQUESTED`: Return Requested
    - `RETURN_APPROVED`: Return Approved
    - `RETURN_RECEIVED`: Return Received
    - `UNDER_INSPECTION`: Under Inspection
    - `REFUND_PROCESSED`: Refund Processed
    - `COMPLETED`: Refund Completed
  - Refund processed amount is credited to user wallet

- **Banner and Coupon Management**:
  - Add, edit, delete banners and coupons

## Getting Started

### Prerequisites

- Node.js
- MongoDB

### Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/safadmt/ecommerce.git
    cd ecommerce
    ```

2. Install dependencies:
    ```bash
    npm install
    ```

3. Set up environment variables:
    - Create a `.env` file in the root directory and add the necessary environment variables:
      ```env
      PORT=5000
      SESSION_SECRET = your session secret
      MONGODB_URI=your_mongodb_uri
      STRIPE_SECRET_KEY=your_stripe_secret_key
      RAZORPAY_KEY_ID=your_razorpay_key_id
      RAZORPAY_KEY_SECRET=your_razorpay_key_secret
      ```

4. Start the application:
    ```bash
    npm start
    ```

## Contributing

Contributions are welcome! Please submit a pull request or create an issue to discuss improvements or bug fixes.



