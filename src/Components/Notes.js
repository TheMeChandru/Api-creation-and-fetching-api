
import noteContext from '../context/notes/notecontext'
import React, { useContext, useEffect, useRef , useState } from 'react'
import Noteitem from './Noteitem';
import AddNote from './addNote';
import { useNavigate } from 'react-router-dom'





const Notes = (props) => {
  const context = useContext(noteContext);
  const ref = useRef(null)
  const refClose = useRef(null)

  const [ note, setNote] = useState({id:"",etitle:"", edescription:"" ,etag:""})
  const { notes, getNotes,editNote } = context;
  let navigate  = useNavigate();
  
  useEffect(() => {
    if(localStorage.getItem('token')){
      getNotes()
    }
    else{
      navigate("/login")
    }
    // eslint-disable-next-line

  }, [])

  const updateNote = (currentNote) => {
    ref.current.click();
    setNote({id: currentNote._id,etitle:currentNote.title, edescription: currentNote.description,etag: currentNote.tag})
    
  }
  const handleClick = (e)=>{
    console.log("Updating the Note")
    editNote(note.id, note.etitle, note.edescription, note.etag)
    e.preventDefault();
    refClose.current.click();
    props.showAlert("Updated Successfully", "success")



}
const onChange =(e)=>{
    setNote({...note,[e.target.name]: e.target.value})
}


  return (

    <>
      <AddNote showAlert={props.showAlert} />


      <button ref={ref} type="button" className="btn btn-primary d-none" data-bs-toggle="modal" data-bs-target="#exampleModal">
        Launch demo modal
      </button>
      <div className="modal fade" id="exampleModal" tabIndex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="exampleModalLabel">Edit Note</h5>
              <button type="button" className="close" data-bs-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div className="modal-body">
              <form>
                <div className="mb-3">
                  <label htmlFor="title" className="form-label">Title</label>
                  <input type="text" className="form-control" id="etitle" name='etitle' value={note.etitle} aria-describedby="emailHelp" onChange={onChange} minLength={5}  required/>
                </div>
                <div className="mb-3">
                  <label htmlFor="description" className="form-label">Description</label>
                  <input type="text" className="form-control" id="edescription" value={note.edescription} name="edescription" onChange={onChange} minLength={5} required/>
                </div>
                <div className="mb-3">
                  <label htmlFor="tag" className="form-label">TAG</label>
                  <input type="text" className="form-control" id="etag" name="etag" value={note.etag} onChange={onChange} />
                </div>

              </form>
            </div>
            <div className="modal-footer">
              <button ref={refClose} type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
              <button disabled={note.etitle.length<5 || note.edescription.length<5} type="button" onClick={handleClick} className="btn btn-primary">Update Notes</button>
            </div>
          </div>
        </div>
      </div>

      <div className="row my-3">
        <h2>Your Notes</h2>
        <div className='container'>
        {notes.length===0 && 'No Notesto display'}
        </div>
        {notes.map((note) => {
          return <Noteitem key={note._id} updateNote={updateNote} showAlert={props.showAlert} note={note} />
        })}
      </div>
    </>
  )
}

export default Notes