//https://discord.js.org/#/docs/main/stable/general/welcome
const Discord = require("discord.js");
const config = require("./config.json");

const client = new Discord.Client();

//SQL
const mysql = require("mysql");


const con = mysql.createConnection({
        host: config.db_host,
        user: config.db_user,
        password: config.db_pw,
        database: config.db_Name
    })
    con.connect(err =>{
        if(err) throw err;
        console.log("Connected to DB!");
        return con;
    });


client.on("ready", () =>{
    console.log("Bot is now online!");
});


client.on('message', (message) => {
    
    //Check if message from bot
    if(message.author.bot) return;
        
    
    //XP-System
    con.query("SELECT * FROM " + config.db_tableName + " WHERE id = " + `${message.author.id}`, (err, rows) =>{
        if(err) throw err;

        let sql;
        if(rows.length < 1){
            sql = "INSERT INTO "+config.db_tableName+"(id, xp) VALUES" + `(${message.author.id}, ${generateXP()})`;
        }else{
            let currentXp = rows[0].xp
            sql = "UPDATE " +config.db_tableName+ " SET xp =" + `${currentXp + generateXP()} where id = ${message.author.id}`;
        }

        con.query(sql);
    })
    
    //Check if message has prefix
    if(!message.content.startsWith(config.prefix)){return;}
    
    //Commands with arguments
    const args = message.content.slice(config.prefix.length).split(/ +/);
    
    //shift() --> takes first element in array and then deletes it from array
    const command = args.shift().toLowerCase();

    if(command === "argsinfo"){
        if(!args.length){
            return message.channel.send(`You didn't provide any arguments, ${message.author}`);
        }
        message.channel.send(`Command: ${command}\nArguments: ${args}`);
    }
    


    //Old commands
    if (command === `ping`) {
        // send back "Pong." to the channel the message was sent in
        message.channel.send('Pong.');
    }
    
    else if(command === `serverinfo`){
        message.channel.send(`Server name: ${message.guild.name}\nTotal members: ${message.guild.memberCount}\nCreated: ${message.guild.createdAt}\nRegion: ${message.guild.region}`);
    }

    else if (command === `userinfo`) {
        message.channel.send(`Your username: ${message.author.username}\nYour ID: ${message.author.tag}\n`);
    }

    else if(command === `loop`){
        for(var i = 0; i < 10 ; i++){
            message.channel.send(i);
        }
    }

    else if(command === "give"){
        //Check if arguments exist
        if(args.length === 0){
            return message.channel.send("Please enter a number as an argument. Example : !give 2")
        }
        //Check is argument is an integer
        if(isNaN(args[0])){
            return message.channel.send("You are supposed to enter a number 😱")
        }
    
        message.channel.send("Here have " +args[0]+ " items!")
    }

    else if(command === "gamble"){
        const x = Math.random();
         
        if(x > 0.5){
            return message.channel.send("You won!")
        }
        return message.channel.send("You lost :(")
    }

    else if(command === "roulette"){
        if(args.length != 2){
            message.channel.send("Try again!\n--> !roulette 'color' 'amount'")
            return;
        }
       //red
        if(!(args[0].toString().toLowerCase().localeCompare("red")) && !(args[0].toString().toLowerCase().localeCompare("black"))){
            message.channel.send("Wrong or no color!\nChoices: red, black");
            return;
        }
        if(isNaN(args[1])){
            message.channel.send("Please enter a valid integer number! (2nd argument)");
            return;
        }

        //Logic if not broken input
        const probabilityRed = Math.random();
        if(probabilityRed > config.winningChanceRoulette){
            message.channel.send("It's black");
            return;
        }

        message.channel.send("It's red!");
        
    }

    else if(command === "points"){
        //If somebody is mentioned
        if (message.mentions.members.first()) {
            const taggedUser = client.users.cache.get(message.mentions.members.first().id);
            var username  = taggedUser.username;

            sql = "Select xp from " + config.db_tableName + ` where id = ${message.mentions.members.first().id}`
            con.query(sql, (err, rows) => {
                if (err) throw err;
                let points = rows[0].xp;
                if (rows[0].xp === 0) {
                    message.channel.send(username + " currently has no " + congfig.channelPointName);
                } else {
                    message.channel.send(username + " currently has " + points + " " + config.channelPointName + "!");
                }
            })
            return;

            //If its for you
        }else{
            sql = "Select xp from " + config.db_tableName + ` where id = ${message.author.id}`
            con.query(sql, (err, rows) =>{
                if(err) throw err;
                let points = rows[0].xp;
                if(rows[0].xp === 0){
                    message.channel.send("You currently have no " + congfig.channelPointName);
                }else{
                    message.channel.send("You currently have "+ points + " " + config.channelPointName+ "!");
                }
            })
            return; 
        }
    }
});


//Helper functions
function generateXP(){
    let min = 2;
    let max = 4;

    return Math.floor(Math.random() * (max - min + 1)) + min;
}


//Log on
client.login(config.token);