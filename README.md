
# AutoPapers with Artifacts

A web page that allows users to browse, filter, and search research papers by title and author. The page is designed to display papers grouped by year, with links to paper PDFs and code repositories.

## Features
- Search by title or author
- Expandable sections for each year of publication
- Clear search functionality
- Modern, responsive design with a clean UI

## Installation Instructions

### 1. Clone the Repository
Clone the project to your local machine using Git:

```bash
git clone https://github.com/yourusername/auto-papers-with-artifacts.git
```

### 2. Install Dependencies
Navigate to the project directory and install the required dependencies:

```bash
cd auto-papers-with-artifacts
npm install
```

### 3. Run the Development Server
Once the dependencies are installed, you can run the development server to view the project locally:

```bash
npm run dev
```

Visit [http://localhost:5173](http://localhost:5173) in your browser to see the project in action.

### 4. Build for Production
To create a production build of the project, run the following command:

```bash
npm run build
```

This will generate a `dist/` folder containing the production-ready files.

## Project Structure

- `src/` - Contains the source code for the React components and App logic.
- `public/` - Contains the static files such as the `papers.json`.
- `vite.config.ts` - Configuration for Vite.
- `tailwind.config.js` - Configuration for Tailwind CSS.
- `package.json` - Contains the dependencies and project scripts.

## Technologies Used
- React (v18)
- Vite (v4)
- Tailwind CSS (v3)
- TypeScript (v4)

## Contributing

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature-branch`).
3. Commit your changes (`git commit -am 'Add new feature'`).
4. Push to the branch (`git push origin feature-branch`).
5. Open a pull request.

## License

This project is licensed under the Apache License - see the [LICENSE](LICENSE) file for details.