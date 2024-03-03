import Role from "../models/Role.js";

export const createRole = async (req, res, next) => {
  try {
    if (req.body.role && req.body.role !== "") {
      const newRole = new Role(req.body);
      await newRole.save();
      return res.send("role created");
    } else {
      res.status(400).send("bad request");
    }
  } catch (error) {
    res.status(500).send("Internal serve error");
  }
};

export const updateRole = async (req, res, next) => {
  try {
    const role = await Role.findById({ _id: req.params.id });
    if (role) {
      const newData = await Role.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true }
      );
      return res.send("role updated");
    } else {
      res.status(400).send("bad request");
    }
  } catch (error) {
    res.status(500).send("Internal serve error");
  }
};

export const getAllRole = async (req, res, next) => {
  try {
    const roles = await Role.find({});
    return res.status(200).send(roles);
  } catch (error) {
    res.status(500).send("Internal serve error");
  }
};

export const deleteRole = async (req, res, next) => {
  try {
    const roleId = req.params.id;
    const role = await Role.findById({ _id: roleId });
    if (role) {
      await Role.findByIdAndDelete(roleId);
      return res.send("role Deleted");
    } else {
      res.status(400).send("bad request");
    }
  } catch (error) {
    res.status(500).send("Internal serve error");
  }
};
