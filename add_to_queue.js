const {pool, mysql} = require('./database_config');

module.exports = function  add_to_queue(custId, skill){
    //select agentid, qlength from agents_iphone where skill =1 
    //insert into iphone_queues (agentid, position, custid) values(slected_agentid, qlength, custid)
    //select returns an array containing each row as an object
    let selectQuery = 'SELECT AgentId, QueueLength from agents_iphone where ?? =1';
    let query = mysql.format(selectQuery,[skill]);
    pool.query(query, (err, result)=>{
        if (err) console.log(err);
        for ( i=0; i<result.length; i++){
            let id = String(result[i].AgentId);
            let pos = String(result[i].QueueLength);
            let insertQuery = 'INSERT INTO iphone_queues (`AgentId`, `Position`, `CustomerId`) VALUES(?,?,?)';
            let newquery = mysql.format(insertQuery,[id,pos,custId]);
            pool.query(newquery,(err,result)=>{
                if (err) console.log(err);
                else console.log("Inserted");
            });
        }
    }); 

}

function delete_from_queue(custId){
    let selectQuery = 'SELECT AgentId FROM iphone_queues WHERE CustomerId = ?';
    let q = mysql.format(selectQuery,[custId])
    pool.query(q, (err,result)=>{
        if (err) console.log(err);
        else{
            for(i=0;i<result.length;i++){
                let id = String(result[i].AgentId);
                let updateQuery = 'UPDATE iphone_queues SET position = position-1 WHERE AgentId = ?';
                updateQuery = mysql.format(updateQuery,[id]);
                pool.query(updateQuery, (err,result)=>{
                    if(err) console.log(err);
                    else console.log("rows affected: " + result.affectedRows);
                });
            }
        }
    });
    let deleteQuery = 'DELETE FROM iphone_queues WHERE CustomerId = ?';
    let query = mysql.format(deleteQuery,[custId]);
    pool.query(query,(err,result) =>{
        if (err) console.log(err);
        else console.log("deleted");
    });
}
//add_to_queue('cust4','skill1');
//add_to_queue('cust1', 'skill2');
//add_to_queue('cust2', 'skill3');
//delete_from_queue('cust2');

//module.exports = add_to_queue()