import axios from "axios";
import { constant } from "./constants";

export const api = () => {
  const config = { baseURL: constant.baseURL };
  return axios.create(config);
};
