// import { createContext, useContext, useState } from "react";
// import {
//   createRelevoRequest,
//   getRelevoRequest,
//   getRelevosRequest,
//   deleteRelevoRequest,
//   updateRelevoRequest,
//   getAllRelevosRequest,
// } from "../api/relevo.js";

// const RelevoContext = createContext();

// export const useRelevo = () => {
//   const context = useContext(RelevoContext);
//   if (!context) {
//     throw new Error("useRelevo must be used within a RelevoProvider");
//   }
//   return context;
// };

// export function RelevoProvider({ children }) {
//   const [relevos, setRelevos] = useState([]);

//   const getRelevos = async () => {
//     try {
//       const res = await getRelevosRequest();
//       setRelevos(res.data);
//     } catch (error) {
//       console.error(error);
//     }
//   };

//   const getAllRelevos = async () => {
//     try {
//       const res = await getAllRelevosRequest();
//       setRelevos(res.data);
//     } catch (error) {
//       console.error(error);
//     }
//   };

//   const deleteRelevo = async (id) => {
//     try {
//       const res = await deleteRelevoRequest(id);
//       if (res.status === 204)
//         setRelevos(relevos.filter((relevo) => relevo._id !== id));
//     } catch (error) {
//       console.error(error);
//     }
//   };

//   const createRelevo = async (data) => {
//     try {
//       const res = await createRelevoRequest(data);
//       setRelevos([...relevos, res.data]);
//     } catch (error) {
//       console.error(error);
//     }
//   };

//   const updateRelevo = async (id, data) => {
//     try {
//       await updateRelevoRequest(id, data);
//     } catch (error) {
//       console.error(error);
//     }
//   };

//   return (
//     <RelevoContext.Provider
//       value={{
//         relevos,
//         getRelevos,
//         getAllRelevos,
//         deleteRelevo,
//         createRelevo,
//         updateRelevo,
//       }}
//     >
//       {children}
//     </RelevoContext.Provider>
//   );
// }
