# NUSHungry -Frontend

This is the frontend for the NUSHungry application.

Of course, here is a detailed README for your project.



## Dependencies

- **@ant-design/icons-vue:** Provides a set of high-quality icons for the user interface.
- **@vitejs/plugin-vue:** Enables Vue.js support in the Vite build tool.
- **ant-design-vue:** A comprehensive UI component library for Vue.js.
- **axios:** A promise-based HTTP client for making API requests.
- **pinia:** A state management library for Vue.js.
- **vite:** A fast and lightweight build tool for modern web development.
- **vue:** A progressive JavaScript framework for building user interfaces.
- **vue-router:** The official router for Vue.js, used for managing application navigation.



## Structure

The project follows a standard Vue.js project structure:

- **`src/`**: Contains the main source code for the application.
  - **`assets/`**: Stores static assets like images and logos.
  - **`components/`**: Holds reusable Vue components, such as `CafeteriaCard`, `Header`, and `StallCard`.
  - **`pages/`**: Contains the main page components of the application, like `HomePage`.
  - **`router/`**: Defines the application's routing configuration using `vue-router`.
  - **`services/`**: Includes modules for making API calls to the backend, such as `cafeteriaService` and `stallService`.
  - **`stores/`**: Contains Pinia store modules for state management, like `cafeteria` and `stall`.
  - **`utils/`**: Provides utility functions, including the Axios instance configuration in `request.js`.

------



## How to Start

To get the frontend up and running, follow these steps:

1. Navigate to the `frontend` directory.

2. Install the dependencies:

   Bash

   ```
   npm install
   ```

3. Run the development server:

   Bash

   ```
   npm run dev
   ```

4. The frontend will be running on `http://localhost:5173`.