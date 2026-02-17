import axios from "./axios";

export const getRelevosRequest = () => axios.get("/relevos");
export const getAllRelevosRequest = () => axios.get("/relevos/all");
export const getRelevoRequest = (id) => axios.get(`/relevos/${id}`);
export const createRelevoRequest = (relevo) => axios.post("/relevos", relevo);
export const updateRelevoRequest = (id, relevo) => axios.put(`/relevos/${id}`, relevo);
export const deleteRelevoRequest = (id) => axios.delete(`/relevos/${id}`);