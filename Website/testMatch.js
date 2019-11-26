function add()
{
    Console.log("Adding...");
    var itm = document.getElementsByClassName("container")[0];
    var cln = itm.cloneNode(true);
    document.getElementById("feed").appendChild(cln);
}

function remove()
{
    Console.log("Removing...");
    var itm = document.getElementById("feed").firstChild;
}

function next(buttonId)
{
    if(buttonId = "up")
    {
        //add X prfolie to liked table
    }

    remove(); //remove current container with X profile
    add(); //add new container with Y profile
}

function test()
{
    alert("testing...");
}