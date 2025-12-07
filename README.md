# 📝 Todo App

A beautiful and responsive Todo application built with React, TypeScript, and Tailwind CSS. This project demonstrates modern web development practices with a clean UI/UX design.

![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

## ✨ Features

- ✅ **Add Todos**: Easily add new tasks to your list
- 🔄 **Toggle Completion**: Mark tasks as completed or incomplete
- 🗑️ **Delete Todos**: Remove tasks you no longer need
- 🎨 **Beautiful UI**: Modern design with Tailwind CSS
- 📱 **Responsive**: Works perfectly on desktop and mobile devices
- 🌙 **Dark Mode Ready**: Supports dark mode themes
- ⚡ **Fast**: Built with Vite for lightning-fast development and builds

## 🚀 Tech Stack

- **Frontend Framework**: React 19
- **Build Tool**: Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **State Management**: React Hooks

## 📦 Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/HamedSadim1/labo3-checkbox.git
   cd labo3-checkbox
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the development server**

   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:5173](http://localhost:5173)

## 📖 Usage

### Adding a Todo

- Type your task in the input field
- Press Enter or click the "Add" button

### Managing Todos

- Click the checkbox to mark a task as completed
- Hover over a task and click the delete icon to remove it

## 🛠️ Available Scripts

| Command           | Description                         |
| ----------------- | ----------------------------------- |
| `npm run dev`     | Starts the development server       |
| `npm run build`   | Builds the app for production       |
| `npm run preview` | Serves the production build locally |

## 📁 Project Structure

```text
src/
├── components/          # Reusable UI components
│   ├── AddTodo.tsx     # Component for adding new todos
│   ├── TodoItem.tsx    # Individual todo item component
│   └── TodoList.tsx    # List container for todos
├── hooks/              # Custom React hooks
│   └── useTodos.ts     # Todo state management hook
├── App.tsx             # Main application component
├── index.tsx           # Application entry point
├── index.css           # Global styles and Tailwind imports
└── react-app-env.d.ts  # TypeScript declarations
```

## 🎯 Key Concepts Demonstrated

- **Component Composition**: Breaking down the UI into reusable components
- **Custom Hooks**: Separating business logic from UI components
- **TypeScript**: Strong typing for better code reliability
- **Modern React**: Using hooks and functional components
- **CSS-in-JS**: Utility-first styling with Tailwind CSS
- **Build Optimization**: Fast development with Vite

## 🤝 Contributing

This is an educational project for the Webframeworks course at AP Hogeschool. Contributions are welcome for learning purposes!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built as part of the Webframeworks lab assignment
- Inspired by modern todo applications
- Thanks to the React and Vite communities for excellent documentation
