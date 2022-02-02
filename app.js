//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");

const mongoose =require("mongoose")
const _=require("lodash")

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
mongoose.connect("mongodb://localhost/todolist")

const itemsSchema =new mongoose.Schema({
  name:String
});
const Item = mongoose.model("Item",itemsSchema)

const item1  = new Item({
  name:"welcome to to-do list"
})
const item2  = new Item({
  name:"welcome "
})
const item3  = new Item({
  name:"to  to-do list"
})
const deafault=[item1,item2,item3]

const list={
  name:String,
  items:[itemsSchema]
}
const List=mongoose.model("List",list);



app.get("/", function(req, res) {
  Item.find((e,items)=>{
    if(items.length==0){
      Item.insertMany(deafault,(e)=>{
  if(e){
  console.log(e)}
  else{
    console.log("Success")
  }
})
res.redirect("/")
    }
    else{
      res.render("list", {listTitle: "Today", newListItems: items });
    }
  })

});
app.get("/:custom",(req,res)=>{
  const listName=_.capitalize(req.params.custom)

  List.findOne({name:listName},function(e,r){
    if(!e){
      if(!r){
        const list=new List({
          name:listName,
          items:deafault
        })
        list.save()
        res.redirect("/"+listName)
      }
      else{
        res.render("list",{listTitle:r.name, newListItems:r.items })
      }
    }
  })
})


app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName=req.body.list
  const item=new Item({
    name:itemName
  })
  if(listName==="Today"){
   item.save()
   res.redirect("/")
  }
  else{
    List.findOne({name:listName},(e,r)=>{
      r.items.push(item)
      r.save();
      res.redirect("/"+listName)

    })
  }
});
app.post("/delete",function(req,res){
  const checked=req.body.checkbox
  const listName=req.body.listName
  if(listName==="Today"){
  Item.findByIdAndRemove(checked,(e)=>{
    if(!e){
      console.log("Success")
      res.redirect("/")
    }
  })
}
else{
  List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checked}}},(e,r)=>{
    if(!e){
      res.redirect("/"+listName)
    }
  })
}
})



app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
