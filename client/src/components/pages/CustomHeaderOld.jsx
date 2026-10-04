import logger from '../../utils/logger';
// import React, { useState, useRef, useEffect } from 'react';
// import { 
//   Menu, 
//   X, 
//   ChevronDown, 
//   User, 
//   Home, 
//   Briefcase, 
//   Wallet as WalletIcon, 
//   ShoppingCart, 
//   Settings, 
//   LogOut,
//   History,
//   Bell,
//   Mail
// } from 'lucide-react';
// import { getCoinBalance } from '../services/coinWallet';
// import BuyCoinsModal from '../wallet/BuyCoinsModalOld';
// import TransactionHistory from '../wallet/TransactionHistory';
// import { fetchUserProfile } from '../services/authProfile';
// import { Link } from 'react-router-dom';
// const CustomHeader = () => {
//   const [menuOpen, setMenuOpen] = useState(false);
//   const [walletOpen, setWalletOpen] = useState(false);
//   const [profileOpen, setProfileOpen] = useState(false);
//   const [notificationsOpen, setNotificationsOpen] = useState(false);
//   const [coinBalance, setCoinBalance] = useState(0);
//   const [showBuyModal, setShowBuyModal] = useState(false);
//   const [showHistoryModal, setShowHistoryModal] = useState(false);
//   const [userProfile, setUserProfile] = useState(null);
//   const [isLoggedIn, setIsLoggedIn] = useState(false);
  
//   const dropdownRef = useRef(null);

//   // Close dropdowns when clicking outside
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
//         setWalletOpen(false);
//         setProfileOpen(false);
//         setNotificationsOpen(false);
//       }
//     };

//     document.addEventListener('mousedown', handleClickOutside);
//     return () => {
//       document.removeEventListener('mousedown', handleClickOutside);
//     };
//   }, []);

//   // Fetch user profile and coin balance
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const token = localStorage.getItem('authToken');
//         if (token) {
//           setIsLoggedIn(true);
//           const profile = await fetchUserProfile(token);
//           setUserProfile(profile);
          
//           const balanceData = await getCoinBalance(profile.userId, token);
//           setCoinBalance(balanceData.coinBalance || 0);
//         } else {
//           setIsLoggedIn(false);
//         }
//       } catch (err) {
//         logger.error('Failed to fetch data:', err);
//         setIsLoggedIn(false);
//       }
//     };
    
//     fetchData();
//   }, [showBuyModal]); // Refresh balance after buying coins

//   return (
//     <header className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg sticky top-0 z-50">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="flex justify-between items-center h-16">
//           {/* Logo */}
//           <div className="flex-shrink-0 flex items-center">
//             <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100">
//               SkillBridge
//             </h1>
//           </div>

//           {/* Desktop Navigation */}
//           <nav className="hidden md:flex items-center space-x-8 ml-10">
//             <a 
//               href="/" 
//               className="flex items-center px-1 pt-1 text-sm font-medium text-white hover:text-blue-100 transition-colors"
//             >
//               <Home className="h-5 w-5 mr-2" />
//               Home
//             </a>
//             <a 
//               href="/jobs" 
//               className="flex items-center px-1 pt-1 text-sm font-medium text-white hover:text-blue-100 transition-colors"
//             >
//               <Briefcase className="h-5 w-5 mr-2" />
//               Jobs
//             </a>

//             {/* Wallet Dropdown - Only shown when logged in */}
//             {isLoggedIn && (
//               <>
//                 <div className="relative" ref={dropdownRef}>
//                   <button
//                     onClick={() => {
//                       setWalletOpen(!walletOpen);
//                       setProfileOpen(false);
//                     }}
//                     className="flex items-center text-gray-700 hover:text-blue-600 transition-colors focus:outline-none group"
//                   >
//                     <div className="flex items-center bg-blue-500/20 px-3 py-1 rounded-full group-hover:bg-blue-500/30 transition-colors">
//                       <WalletIcon className="h-5 w-5 mr-2 text-yellow-500" />
//                       <span className="font-medium text-white">My Coins Wallet</span>
//                       <ChevronDown className={`ml-1 h-4 w-4 transition-transform ${walletOpen ? 'rotate-180' : ''}`} />
//                     </div>
//                   </button>
//                   {walletOpen && (
//                     <div className="absolute mt-2 w-72 bg-white shadow-xl rounded-lg py-2 z-50 border border-gray-100 right-0">
//                       <div className="p-4 border-b border-gray-100">
//                         <div className="flex items-center justify-between mb-1">
//                           <span className="text-sm font-medium text-gray-500">Available Balance</span>
//                           <div className="flex items-center">
//                             <WalletIcon className="h-4 w-4 mr-1 text-yellow-500" />
//                             <span className="font-semibold text-gray-800">{coinBalance}</span>
//                           </div>
//                         </div>
//                       </div>
                      
//                       <div className="p-2">
//                         <button
//                           className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-blue-50 transition-colors text-left"
//                           onMouseDown={(e) => {
//                             e.stopPropagation(); 
//                             setShowBuyModal(true);
//                             setTimeout(() => setWalletOpen(false), 100);
//                           }}
//                         >
//                           <div className="flex items-center">
//                             <div className="bg-yellow-100 p-2 rounded-full mr-3">
//                               <ShoppingCart className="h-4 w-4 text-yellow-500" />
//                             </div>
//                             <div>
//                               <p className="font-medium text-gray-800">Buy More Coins</p>
//                               <p className="text-xs text-gray-500">Add to your wallet balance</p>
//                             </div>
//                           </div>
//                           <ChevronDown className="text-gray-400 text-xs transform -rotate-90" />
//                         </button>
                        
//                         <button
//                           className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-blue-50 transition-colors text-left"
//                           onMouseDown={(e) => {
//                             e.stopPropagation();
//                             setShowHistoryModal(true);
//                             setTimeout(() => setWalletOpen(false), 100);
//                           }}
//                         >
//                           <div className="flex items-center">
//                             <div className="bg-blue-100 p-2 rounded-full mr-3">
//                               <History className="h-4 w-4 text-blue-500" />
//                             </div>
//                             <div>
//                               <p className="font-medium text-gray-800">Transaction History</p>
//                               <p className="text-xs text-gray-500">View your purchase history</p>
//                             </div>
//                           </div>
//                           <ChevronDown className="text-gray-400 text-xs transform -rotate-90" />
//                         </button>
//                       </div>
                      
//                       <div className="px-4 py-2 border-t border-gray-100">
//                         <a 
//                           href="/wallet" 
//                           className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
//                           onMouseDown={(e) => {
//                             e.stopPropagation(); 
//                             setTimeout(() => setWalletOpen(false), 100);
//                           }}
//                         >
//                           View full wallet details
//                         </a>
//                       </div>
//                     </div>
//                   )}
//                 </div>

//                 {/* Notifications - Only shown when logged in */}
//                 <div className="relative">
//                   <button
//                     className="text-white hover:text-blue-100 transition-colors relative focus:outline-none"
//                     onClick={() => {
//                       setNotificationsOpen(!notificationsOpen);
//                       setProfileOpen(false);
//                     }}
//                   >
//                     <Bell className="h-5 w-5" />
//                     <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
//                       3
//                     </span>
//                   </button>
//                   {notificationsOpen && (
//                     <div className="absolute mt-2 w-72 bg-white shadow-lg rounded-md py-1 z-50 right-0 border border-gray-100">
//                       <div className="px-4 py-2 font-medium text-gray-700 border-b border-gray-100">
//                         Notifications
//                       </div>
//                       <div className="max-h-60 overflow-y-auto">
//                         {[1, 2, 3].map((item) => (
//                           <a key={item} href="#" className="block px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 border-b border-gray-100">
//                             <div className="font-medium">New professional available</div>
//                             <div className="text-gray-500 text-xs">2 hours ago</div>
//                           </a>
//                         ))}
//                       </div>
//                       <a href="#" className="block px-4 py-2 text-sm text-center text-blue-600 hover:bg-blue-50">
//                         View All
//                       </a>
//                     </div>
//                   )}
//                 </div>

//                 {/* Messages - Only shown when logged in */}
//                 <div className="relative">
//                 <Link
//                   to="/messages"
//                   className="text-white hover:text-blue-100 transition-colors relative flex items-center focus:outline-none"
//                 >
//                   <Mail className="h-5 w-5" />
//                   <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
//                     {userProfile?.unreadMessagesCount || 0}
//                   </span>
//                 </Link>
//                 </div>

//                 {/* Profile Dropdown - Only shown when logged in */}
//                 <div className="relative ml-4" ref={dropdownRef}>
//                   <button
//                     onClick={() => {
//                       setProfileOpen(!profileOpen);
//                       setWalletOpen(false);
//                     }}
//                     className="flex items-center text-sm rounded-full focus:outline-none"
//                   >
//                     <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center border-2 border-white hover:bg-blue-400 transition-colors">
//                       <User className="h-5 w-5 text-white" />
//                     </div>
//                     <span className="ml-2 text-white">
//                       {userProfile ? `${userProfile.username}` : ''}
//                     </span>
//                     <ChevronDown className={`ml-1 h-4 w-4 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
//                   </button>
//                   {profileOpen && (
//                     <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 py-1 z-50">
//                       <div className="px-4 py-2 text-gray-700 border-b border-gray-100">
//                         <div className="font-medium">
//                         {userProfile ? `${userProfile.username}` : 'User'}
//                         </div>
//                         <div className="text-xs text-gray-500">{userProfile ? `${userProfile.roleName}` : 'User'}</div>
//                       </div>
//                       <a 
//                         href="/profile" 
//                         className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600"
//                       >
//                         <User className="h-4 w-4 mr-2 text-blue-500" />
//                         My Profile
//                       </a>
//                       <a 
//                         href="/settings" 
//                         className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600"
//                       >
//                         <Settings className="h-4 w-4 mr-2 text-blue-500" />
//                         Settings
//                       </a>
//                       <div className="border-t border-gray-100"></div>
//                       <a 
//                         href="/logout" 
//                         className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600"
//                       >
//                         <LogOut className="h-4 w-4 mr-2 text-blue-500" />
//                         Logout
//                       </a>
//                     </div>
//                   )}
//                 </div>
//               </>
//             )}

//             {/* Login/Signup buttons when not logged in */}
//             {!isLoggedIn && (
//               <div className="flex space-x-4">
//                 <a 
//                   href="/login" 
//                   className="px-4 py-2 text-sm font-medium text-white hover:text-blue-100 transition-colors"
//                 >
//                   Login
//                 </a>
//                 <a 
//                   href="/signup" 
//                   className="px-4 py-2 text-sm font-medium bg-white text-blue-600 rounded-md hover:bg-blue-50 transition-colors"
//                 >
//                   Sign Up
//                 </a>
//               </div>
//             )}
//           </nav>

//           {/* Mobile menu button */}
//           <div className="md:hidden flex items-center">
//             <button
//               onClick={() => setMenuOpen(!menuOpen)}
//               className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-blue-100 hover:bg-blue-700 focus:outline-none transition-colors"
//             >
//               {menuOpen ? (
//                 <X className="h-6 w-6" />
//               ) : (
//                 <Menu className="h-6 w-6" />
//               )}
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Mobile Navigation */}
//       {menuOpen && (
//         <div className="md:hidden bg-blue-700 px-4 pb-4">
//           <div className="pt-2 pb-3 space-y-1">
//             <a
//               href="/"
//               className="flex items-center px-3 py-2 rounded-md text-base font-medium text-white hover:bg-blue-600"
//             >
//               <Home className="h-5 w-5 mr-3" />
//               Home
//             </a>
//             <a
//               href="/jobs"
//               className="flex items-center px-3 py-2 rounded-md text-base font-medium text-white hover:bg-blue-600"
//             >
//               <Briefcase className="h-5 w-5 mr-3" />
//               Jobs
//             </a>

//             {/* Mobile Wallet Section - Only shown when logged in */}
//             {isLoggedIn && (
//               <>
//                 <div className="px-3 py-2 bg-blue-600/20 rounded-lg">
//                   <div className="flex items-center justify-between">
//                     <div className="flex items-center">
//                       <WalletIcon className="h-5 w-5 mr-3 text-yellow-500" />
//                       <span className="font-medium">Wallet Balance</span>
//                     </div>
//                     <span className="font-semibold">{coinBalance} Coins</span>
//                   </div>
//                   <div className="flex space-x-2 mt-3">
//                     <button
//                       className="flex-1 bg-yellow-500 text-white py-1 px-3 rounded text-sm hover:bg-yellow-600 transition-colors flex items-center justify-center"
//                       onClick={() => {
//                         setShowBuyModal(true);
//                         setMenuOpen(false);
//                       }}
//                     >
//                       <ShoppingCart className="h-4 w-4 mr-1" />
//                       Buy Coins
//                     </button>
//                     <button
//                       className="flex-1 bg-blue-500/30 text-white py-1 px-3 rounded text-sm hover:bg-blue-500/40 transition-colors flex items-center justify-center"
//                       onClick={() => {
//                         setShowHistoryModal(true);
//                         setMenuOpen(false);
//                       }}
//                     >
//                       <History className="h-4 w-4 mr-1" />
//                       History
//                     </button>
//                   </div>
//                 </div>

//                 {/* Mobile Notifications - Only shown when logged in */}
//                 <a
//                   href="#"
//                   className="flex items-center px-3 py-2 rounded-md text-base font-medium text-white hover:bg-blue-600"
//                 >
//                   <Bell className="h-5 w-5 mr-3" />
//                   Notifications
//                   <span className="ml-auto bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
//                     3
//                   </span>
//                 </a>

//                 {/* Mobile Messages - Only shown when logged in */}
//                 <a
//                   href="#"
//                   className="flex items-center px-3 py-2 rounded-md text-base font-medium text-white hover:bg-blue-600"
//                 >
//                   <Mail className="h-5 w-5 mr-3" />
//                   Messages
//                   <span className="ml-auto bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
//                     5
//                   </span>
//                 </a>

//                 {/* Mobile Profile Dropdown - Only shown when logged in */}
//                 <div className="px-3 py-2">
//                   <div className="flex items-center px-3 py-2 rounded-md text-base font-medium text-white">
//                     <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center border-2 border-white mr-3">
//                       <User className="h-5 w-5 text-white" />
//                     </div>
//                     {userProfile ? `${userProfile.email}` : 'User'}
//                   </div>
//                   <div className="ml-12 mt-1 space-y-1">
//                     <a
//                       href="/profile"
//                       className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-white hover:bg-blue-600"
//                     >
//                       <User className="h-4 w-4 mr-3" />
//                       My Profile
//                     </a>
//                     <a
//                       href="/settings"
//                       className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-white hover:bg-blue-600"
//                     >
//                       <Settings className="h-4 w-4 mr-3" />
//                       Settings
//                     </a>
//                     <a
//                       href="/logout"
//                       className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-white hover:bg-blue-600"
//                     >
//                       <LogOut className="h-4 w-4 mr-3" />
//                       Logout
//                     </a>
//                   </div>
//                 </div>
//               </>
//             )}

//             {/* Mobile Login/Signup buttons when not logged in */}
//             {!isLoggedIn && (
//               <div className="space-y-2 pt-2">
//                 <a
//                   href="/login"
//                   className="block w-full text-center px-4 py-2 rounded-md text-base font-medium text-white bg-blue-800 hover:bg-blue-900 transition-colors"
//                 >
//                   Login
//                 </a>
//                 <a
//                   href="/signup"
//                   className="block w-full text-center px-4 py-2 rounded-md text-base font-medium text-blue-800 bg-white hover:bg-blue-50 transition-colors"
//                 >
//                   Sign Up
//                 </a>
//               </div>
//             )}
//           </div>
//         </div>
//       )}

//       {/* Wallet Modals - Only shown when logged in */}
//       {isLoggedIn && (
//         <>
//           {showBuyModal && (
//             <BuyCoinsModal
//               userId={userProfile?.userId}
//               isOpen={showBuyModal}
//               onClose={() => setShowBuyModal(false)}
//               onSuccess={() => {
//                 setShowBuyModal(false);
//                 // Balance will refresh automatically due to useEffect dependency
//               }}
//             />
//           )}

//           {showHistoryModal && (
//             <TransactionHistory
//               userId={userProfile?.userId}
//               onClose={() => setShowHistoryModal(false)}
//             />
//           )}
//         </>
//       )}
//     </header>
//   );
// };

// export default CustomHeader;