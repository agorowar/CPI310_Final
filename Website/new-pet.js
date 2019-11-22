//Create a new pet
app.post("/new-pet", async(req, res) => {
    const db = await dbPromise;
    //const user = db.get();
    const { petname, species, gender, age, petbio, otherpetinfo  } = req.body;
    await db.run(
        "INSERT INTO pets (petname, species, gender, age, petbio, otherpetinfo) VALUES (?, ?, ?, ?, ?, ?)",
        petname, 
        species, 
        gender,
        age, 
        petbio, 
        otherpetinfo,
    )
    res.redirect("/profile");
});

app.get("/new-pet"), (req,res)=>{
    const token = req.cookies.authToken;
    if(!token)
    {
        res.redirect("/login?from=new-pet")
    } else{
        res.render("new-pet");
    }
}

