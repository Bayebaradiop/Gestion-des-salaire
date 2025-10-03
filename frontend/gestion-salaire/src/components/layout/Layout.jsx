import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const Layout = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50/30 to-purple-50/30 dark:from-gray-950 dark:via-indigo-950/30 dark:to-purple-950/30 flex flex-col">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="p-6 lg:p-8"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default Layout;