const express =require("express")
const router =express.Router()
const Organisation =require("../models/organisation")

//get all
router.get("/",async (req,res)=>{
    try {
        const organisations =await Organisation.find()
        res.json(organisations)
    } catch (error) {
        res.status(500).json({message:error?.message})
    }

})
//get one
router.get("/:id",getOrganisation,(req,res)=>{
res.json(res.organisation)
})
//update--pending
router.patch("/:id",getOrganisation,async(req,res)=>{
  if (req.body.name !== undefined) {
    res.organisation.name = req.body.name;
  }
  if (req.body.description !== undefined) {
    res.organisation.description = req.body.description;
  }
  if (req.body.members !== undefined) {
    res.organisation.members = req.body.members;
  }
  if (req.body.admins !== undefined) {
    res.organisation.admins = req.body.admins;
  }

try {
    const updatedOrganisation = await res.organisation.save()
    res.json(updatedOrganisation)
} catch (error) {
            res.status(400).json({message:error?.message})

}
})
//create
router.post("/",async (req,res)=>{
    try {
    const organisation = new Organisation({
      name: req.body.name,
      description: req.body.description,
      avatarUrl: req.body.avatarUrl,
      members:req.body.members,
      admins:req.body.admins
 
    });
    const newOrganisation =await organisation.save()
    res.status(201).json(newOrganisation)
} catch (error) {
        res.status(400).json({message:error?.message})
    
}
})
//delete
router.delete("/:id",getOrganisation,async(req,res)=>{
try {
    await res.organisation.deleteOne();
    res.json({message:"Deleted"})
} catch (error) {
        res.status(500).json({message:error?.message})
    
}
})


async function getOrganisation(req,res,next) {
    let organisation
    try {
        organisation =await Organisation.findById(req.params.id)
        if(organisation == null){
            return res.status(401).json({message:"cant not find organisation"})
        }
    } catch (error) {
        res.status(500).json({message:error?.message})
        
    }
    res.organisation=organisation
    next()
}
module.exports =router