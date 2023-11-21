const express = require("express");
const fetchuser = require("../middleWare/fetchuser");
const router = express.Router();
const Note = require("../models/Note");
const { body, validationResult } = require("express-validator");

// route1 :Get all the notes using : get "/api/notes/getuser". login required
router.get("/fetchznotes", fetchuser, async (req, res) => {
  try {
    const note = await Note.find({ user: req.user.id });
    res.json(note);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("internal server Error");
  }
});

// route 2 :Add a new notes using :post "/api/notes/assnote".login required

router.post(
  "/addnotes",
  fetchuser,
  [
    body("title", "Enter a valid title").isLength({ min: 3 }),
    body("description", "Descriotion must be atleast 5 charecters").isLength({
      min: 5,
    }),
  ],
  async (req, res) => {
    try {
      const { title, description, tag } = req.body;
      //if there are error , return Bad request and the errors
      const error = validationResult(req);
      if (!error.isEmpty()) {
        return res.status(400).json({ error: error.array() });
      }
      const note = new Note({
        title,
        description,
        tag,
        user: req.user.id,
      });
      const saveNote = await note.save();
      res.json(saveNote);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("internal server error");
    }
  }
);

// router 3 :update an existing notes using: put "/api/notes/apdatenotes0" .login require

router.put("/updatenote/:id", fetchuser, async (req, res) => {
  const { title, description, tag } = req.body;
  try {
  // create a newnote object
  const newNote = {};
  if (title) {
    newNote.title = title;
  }
  if (description) {
    newNote.description = description;
  }
  if (tag) {
    newNote.tag = tag;
  }


// find the note to be update and update it
let note =  await Note.findById(req.params.id);
if (!note) {
  return res.status(404).send("Not Found");
}

if (note.user.toString() !== req.user.id) {
  return res.status(401).send("Not Alllowed");
}
note=await Note.findByIdAndUpdate(req.params.id,{$set:newNote},{new:true})
res.json({note})
} catch (error) {
  console.error(error.message);
  res.status(500).send("Internal Server Error");
}
});



// route 4 :delete an existing notes using :delrte "api/notes/updatenote" . logo=in require
router.delete('/deletenote/:id', fetchuser, async (req, res) => {
  try {
      // Find the note to be delete and delete it
      let note = await Note.findById(req.params.id);
      if (!note) { return res.status(404).send("Not Found") }

      // Allow deletion only if user owns this Note
      if (note.user.toString() !== req.user.id) {
          return res.status(401).send("Not Allowed");
      }

      note = await Note.findByIdAndDelete(req.params.id)
      res.json({ "Success": "Note has been deleted", note: note });
  } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Server Error");
  }
})

module.exports = router;
