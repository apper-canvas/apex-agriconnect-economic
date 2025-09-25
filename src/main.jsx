import ReactDOM from "react-dom/client"
import { Provider } from "react-redux"
import { configureStore } from "@reduxjs/toolkit"
import userSlice from "@/store/userSlice"
import App from "./App.jsx"
import "./index.css"

const store = configureStore({
  reducer: {
    user: userSlice,
  },
})

ReactDOM.createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <App />
  </Provider>
)