const express = require('express');
const router = express.Router();
const Patient = require('../models/Patient');
const { Blockchain } = require('../models/Block');

const medicalBlockchain = new Blockchain();

router.get('/', async (req, res) => {
  try {
    const patients = await Patient.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      count: patients.length,
      isChainValid: medicalBlockchain.isChainValid(),
      data: patients
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      return res.status(404).json({ success: false, error: 'Patient not found' });
    }
    res.json({ success: true, data: patient });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { patientId, name, age, bloodGroup, diagnosis, doctor } = req.body;
    const newBlock = medicalBlockchain.addBlock({
      patientId, name, age, bloodGroup, diagnosis, doctor
    });
    const patient = await Patient.create({
      patientId, name, age, bloodGroup, diagnosis, doctor,
      blockHash: newBlock.hash,
      previousHash: newBlock.previousHash,
      blockIndex: newBlock.index
    });
    res.status(201).json({ success: true, data: patient, block: newBlock });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const patient = await Patient.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: patient });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await Patient.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Patient record deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/blockchain/validate', (req, res) => {
  res.json({
    isValid: medicalBlockchain.isChainValid(),
    chainLength: medicalBlockchain.chain.length,
    chain: medicalBlockchain.chain
  });
});

module.exports = router;