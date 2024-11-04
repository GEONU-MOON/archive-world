const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();
const Visitor = require("../models/Visitor");

router.post("/add-visitor", async (req, res) => {
  try {
    const { visitor_no, writer, writer_avatar, content, password } = req.body;

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newVisitor = new Visitor({
      visitor_no,
      writer,
      writer_avatar,
      content,
      password: hashedPassword, 
    });

    await newVisitor.save();

    res.status(201).json({ message: "Visitor successfully created", visitor: newVisitor });
  } catch (error) {
    res.status(500).json({ message: "Failed to create visitor", error: error.message });
  }
});

router.get("/visitors-read", async (req, res) => {
  try {
    const visitors = await Visitor.find();
    res.status(200).json(visitors);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve visitors", error: error.message });
  }
});

router.get("/visitor/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const visitor = await Visitor.findById(id);

    if (!visitor) {
      return res.status(404).json({ message: "Visitor not found" });
    }

    res.status(200).json(visitor);
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve visitor", error: error.message });
  }
});

router.put("/visitor-update/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { visitor_no, writer, writer_avatar, content, currentPassword } = req.body;

    const existingVisitor = await Visitor.findById(id);
    if (!existingVisitor) {
      return res.status(404).json({ message: "Visitor not found" });
    }

    const isPasswordCorrect = await bcrypt.compare(currentPassword, existingVisitor.password);
    if (!isPasswordCorrect) {
      return res.status(403).json({ message: "Incorrect password" }); 
    }

    const updatedFields = { visitor_no, writer, writer_avatar, content };

    const updatedVisitor = await Visitor.findByIdAndUpdate(id, updatedFields, { new: true });

    res.status(200).json({ message: "Visitor successfully updated", visitor: updatedVisitor });
  } catch (error) {
    res.status(500).json({ message: "Failed to update visitor", error: error.message });
  }
});

router.delete("/visitor-delete/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { currentPassword } = req.body; 

    const existingVisitor = await Visitor.findById(id);
    if (!existingVisitor) {
      return res.status(404).json({ message: "Visitor not found" });
    }

    const isPasswordCorrect = await bcrypt.compare(currentPassword, existingVisitor.password);
    if (!isPasswordCorrect) {
      return res.status(403).json({ message: "Incorrect password" }); 
    }

    await Visitor.findByIdAndDelete(id);

    res.status(200).json({ message: "Visitor successfully deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete visitor", error: error.message });
  }
});

module.exports = router;
