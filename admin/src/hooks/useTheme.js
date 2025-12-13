// import { useContext } from "react";
// import { ThemeContext } from "../context/ThemeContext";

// // Tạo Custom Hook để sử dụng ThemeContext
// export const useTheme = () => {
//   const context = useContext(ThemeContext);

//   // 1. Kiểm tra lỗi nếu hook được gọi bên ngoài Provider
//   if (context === null) {
//     throw new Error("useTheme must be used within a ThemeProvider");
//   }

//   // 2. Trả về giá trị của Context (theme và toggleTheme)
//   return context;
// };
