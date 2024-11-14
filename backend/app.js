const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');  
const app = express();

app.use(cors());  
app.use(express.json());


let complaintsQueue = [];
let resolvedComplaintsStack = [];


const priorityLevels = {
  HIGH: 3,
  MEDIUM: 2,
  LOW: 1
};


function determinePriority(complaint) {
  if (complaint.healthRisk || complaint.location === 'school' || complaint.location === 'hospital') {
    return priorityLevels.HIGH;
  } else if (complaint.missedPickups > 1) {
    return priorityLevels.MEDIUM;
  } else {
    return priorityLevels.LOW;
  }
}


function addComplaintToQueue(complaint) {
  const priority = determinePriority(complaint);
  complaint.priority = priority;
  complaintsQueue.push(complaint);
  complaintsQueue.sort((a, b) => b.priority - a.priority);  
}


app.post('/complaints', (req, res) => {
  console.log("Received complaint:", req.body);

  const complaint = {
    id: complaintsQueue.length + 1,
    description: req.body.description,
    location: req.body.location,
    missedPickups: req.body.missedPickups || 0,
    healthRisk: req.body.healthRisk || false,
    status: 'Pending',
    timestamp: new Date()
  };

  addComplaintToQueue(complaint);
  console.log("Complaint added to queue:", complaint);

  res.status(201).send(complaint);
});


app.get('/complaints', (req, res) => {
  res.send(complaintsQueue);
});


app.put('/resolve/:id', (req, res) => {
  const complaintId = parseInt(req.params.id);
  const complaintIndex = complaintsQueue.findIndex(c => c.id === complaintId);

  if (complaintIndex === -1) {
    return res.status(404).send({ message: 'Complaint not found' });
  }

  const complaint = complaintsQueue[complaintIndex];
  complaint.status = 'Resolved';
  complaintsQueue.splice(complaintIndex, 1);
  resolvedComplaintsStack.push(complaint);

 
  logResolvedComplaint(complaint);
  res.send(complaint);
});


function logResolvedComplaint(complaint) {
  const logFilePath = path.join(__dirname, 'resolved_complaints.csv');
  const logData = `${complaint.id},${complaint.description},${complaint.location},${complaint.status},${complaint.timestamp}\n`;

  fs.appendFile(logFilePath, logData, (err) => {
    if (err) console.error('Error logging complaint:', err);
  });
}


app.get('/logs', (req, res) => {
  const logFilePath = path.join(__dirname, 'resolved_complaints.csv');

  fs.readFile(logFilePath, 'utf8', (err, data) => {
    if (err) return res.status(500).send({ message: 'Could not retrieve logs' });
    res.header('Content-Type', 'text/csv');
    res.send(data);
  });
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
