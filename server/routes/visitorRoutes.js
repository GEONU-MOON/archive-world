const express = require("express");
const router = express.Router();
const Visitor = require("../models/Visitor");

router.post("/add-visitor", async (req, res) => {
  try {
    const { visitor_no, writer, writer_avatar, content } = req.body;

    const newVisitor = new Visitor({
      visitor_no,
      writer,
      writer_avatar,
      content,
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
    const { visitor_no, writer, writer_avatar, content } = req.body;

    const updatedVisitor = await Visitor.findByIdAndUpdate(id, { visitor_no, writer, writer_avatar, content }, { new: true });

    if (!updatedVisitor) {
      return res.status(404).json({ message: "Visitor not found" });
    }

    res.status(200).json({ message: "Visitor successfully updated", visitor: updatedVisitor });
  } catch (error) {
    res.status(500).json({ message: "Failed to update visitor", error: error.message });
  }
});

router.delete("/visitor-delete/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const deletedVisitor = await Visitor.findByIdAndDelete(id);

    if (!deletedVisitor) {
      return res.status(404).json({ message: "Visitor not found" });
    }

    res.status(200).json({ message: "Visitor successfully deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete visitor", error: error.message });
  }
});

module.exports = router;
