const express =require("express")
const router =express.Router()
const Subscribers =require("../models/subscribers")

//get all
router.get("/",async (req,res)=>{
    try {
        const subscribers =await Subscribers.find()
        res.json(subscribers)
    } catch (error) {
        res.status(500).json({message:error?.message})
    }

})
//get one
router.get("/:id",getSubscriber,(req,res)=>{
res.json(res.subscriber)
})
//update
router.patch("/:id",getSubscriber,async(req,res)=>{
if(req.body.name !== null){
    res.subscriber.name = req.body.name
}
if(req.body.title != null){
        res.subscriber.title = req.body.title

}
try {
    const updatedSubscriber = await res.subscriber.save()
    res.json(updatedSubscriber)
} catch (error) {
            res.status(400).json({message:error?.message})

}
})
//create
router.post("/",async (req,res)=>{
const subscriber =new Subscribers ({
    name:req.body.name,
    title:req.body.title
})
try {
    const newsubscriber =await subscriber.save()
    res.status(201).json(newsubscriber)
} catch (error) {
        res.status(400).json({message:error?.message})
    
}
})
//delete
router.delete("/:id",getSubscriber,async(req,res)=>{
try {
    await res.subscriber.deleteOne();
    res.json({message:"Deleted"})
} catch (error) {
        res.status(500).json({message:error?.message})
    
}
})

async function getSubscriber(req,res,next) {
    let subscriber 
    try {
        subscriber =await Subscribers.findById(req.params.id)
        if(subscriber == null){
            return res.status(401).json({message:"cant not find subscriber"})
        }
    } catch (error) {
        res.status(500).json({message:error?.message})
        
    }
    res.subscriber=subscriber
    next()
}
module.exports =router