import mongoose from 'mongoose';
import DepartmentHead from '../models/department-head.model.js';

const departmentHeadController = {
  create: async (req, res) => {
    try {
      const { company } = req.body;
      
      const departmentHead = new DepartmentHead({
        company,
        posted_jobs: [],
        candidatList: []
      });

      await departmentHead.save();
      res.status(201).json(departmentHead);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  getAll: async (req, res) => {
    try {
      const departmentHeads = await DepartmentHead.find();
      res.json(departmentHeads);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  getById: async (req, res) => {
    try {
      const departmentHead = await DepartmentHead.findOne({ id: req.params.id });
      if (!departmentHead) {
        return res.status(404).json({ message: 'Department head not found' });
      }
      res.json(departmentHead);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  addJob: async (req, res) => {
    try {
      const { jobId } = req.body;
      const departmentHead = await DepartmentHead.findOne({ id: req.params.id });
      
      if (!departmentHead) {
        return res.status(404).json({ message: 'Department head not found' });
      }

      departmentHead.posted_jobs.push(jobId);
      await departmentHead.save();
      
      res.json(departmentHead);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  addCandidate: async (req, res) => {
    try {
      const { candidateId } = req.body;
      const departmentHead = await DepartmentHead.findById(req.params.id);
      
      if (!departmentHead) {
        return res.status(404).json({ message: 'Department head not found' });
      }

      departmentHead.candidatList.push(candidateId);
      await departmentHead.save();
      
      res.json(departmentHead);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
};

export default departmentHeadController; 