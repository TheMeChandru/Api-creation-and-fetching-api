const express = require('express');
const router = express.Router();
var fetchuser = require('../middleware/fetchuser');
const Note = require('../models/Note');
const { body, validationResult } = require('express-validator');




// Route 1: Get all the Notes using Get "/api/notes/fetchallnotes" , login required

router.get('/fetchallnotes', fetchuser, async  (req, res)=>{
    try {
        const notes = await Note.find({user: req.user.id});
        res.json(notes)
        
    }catch (error){
        console.error(error.message);
        res.status(500).send("Some Error Occured");
    }
})

// Route 2: Get add New Notes using POST "/api/notes/addnote" , login required

router.post('/addnote', fetchuser,[
    body('title','Enter a valid Title').isLength({min :3}),
    body('description','description must be at least 5 character').isLength({min :5}),
], async  (req, res)=>{

    try {
    const {title, description, tag} = req.body;

    // If there are errors return bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()})
    }

    const note = new Note({
    title, description, tag, user: req.user.id
    })
    const savednote = await note.save()

   res.json(savednote)
}catch (error){
    console.error(error.message);
    res.status(500) .send("Some Error Occured");
}
})


// Route 3:Update an Exsisting Note using PUT "/api/notes/updatenote" , login required
router.put('/updatenote/:id', fetchuser, async  (req, res)=>{
    const {title, description, tag} = req.body;

    try {
    // create a Newnote object
    const newNote = {};
    if(title){newNote.title = title};
    if(description){newNote.description = description};
    if(tag){newNote.tag = tag};

    // Find the note to be updated

    let note = await Note.findById(req.params.id);
    if(!note){return res.status(404).send("Not found")}

    if(note.user.toString() !== req.user.id){
        return res.status(401).send("Not Allowed");
    }

    note = await Note.findByIdAndUpdate(req.params.id, {$set: newNote}, {new: true})
    res.json({note});

} catch (error){
    console.error(error.message);
    res.status(500) .send("Internal Server Error");
}

})  


// Route 4:Delete an Exsisting Note using DELETE "/api/notes/deletenote" , login required
router.delete('/deletenote/:id', fetchuser, async  (req, res)=>{
    const {title, description, tag} = req.body;

    try {
    // Find the note to be Delete it

    let note = await Note.findById(req.params.id);
    if(!note){return res.status(404).send("Not found")}

    // Allow Deletion if user owns this Note
    if(note.user.toString() !== req.user.id){
        return res.status(401).send("Not Allowed");
    }

    note = await Note.findByIdAndDelete(req.params.id, {new: true})
    res.json({"Success": "Note has been Deleted", note:note});

} catch (error){
    console.error(error.message);
    res.status(500) .send("Internal Server Error");
}
})    

module.exports = router