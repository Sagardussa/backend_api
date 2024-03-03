import express from "express";
import Role from "../models/Role.js";
import {
  createRole,
  deleteRole,
  getAllRole,
  updateRole,
} from "../controllers/role.controller.js";
import { verifyAdmin } from "../utils/verifytoken.js";
const router = express.Router();

///create new role in DB
router.post("/create", verifyAdmin, createRole);

//update role in DB
router.put("/update/:id", verifyAdmin, updateRole);

//get All role in DB
router.get("/getall", getAllRole);

//delete Role
router.delete("/deleteRole/:id", deleteRole);

export default router;
