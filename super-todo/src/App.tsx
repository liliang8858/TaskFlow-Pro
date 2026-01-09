import { TodoProvider } from './context/TodoContext';
import { TodoInput } from './components/TodoInput';
import { TodoList } from './components/TodoList';
import { Stats } from './components/Stats';
import { Header } from './components/Header';

function App() {
  return (
    <TodoProvider>
      <div className="min-h-screen py-8 px-4 md:px-6 max-w-5xl mx-auto font-sans">
        <Header />
        
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
           <Stats />
           
           <div className="grid grid-cols-1 gap-8">
             <TodoInput />
             <TodoList />
           </div>
        </div>
        
        <footer className="mt-20 py-8 text-center text-sm text-text-sub opacity-70">
            <p>&copy; {new Date().getFullYear()} TaskFlow Pro. Created with ❤️ by Trae.</p>
        </footer>
      </div>
    </TodoProvider>
  );
}

export default App;
