import HR from '../models/hr.model.js';
import User from '../models/user.model.js';

const hrController = {
  // Create new HR
  create: async (req, res) => {
    try {
      const hr = new HR(req.body);
      await hr.save();
      res.status(201).json(hr);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // Get all HRs
  getAll: async (req, res) => {
    try {
      const hrs = await User.find({ role: 'hr' }).select('-password');
      res.json(hrs);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Get HR by ID
  getById: async (req, res) => {
    try {
      const hr = await HR.findById(req.params.id)
        .populate('managed_candidates')
        .populate('managed_departments');
      if (!hr) {
        return res.status(404).json({ message: 'HR not found' });
      }
      res.json(hr);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Update HR
  update: async (req, res) => {
    try {
      const hr = await HR.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );
      if (!hr) {
        return res.status(404).json({ message: 'HR not found' });
      }
      res.json(hr);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // Delete HR
  delete: async (req, res) => {
    try {
      const hr = await HR.findByIdAndDelete(req.params.id);
      if (!hr) {
        return res.status(404).json({ message: 'HR not found' });
      }
      res.json({ message: 'HR deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Assign candidate to HR
  assignCandidate: async (req, res) => {
    try {
      const { candidateId } = req.body;
      const hr = await HR.findById(req.params.id);
      
      if (!hr) {
        return res.status(404).json({ message: 'HR not found' });
      }

      hr.managed_candidates.push(candidateId);
      await hr.save();
      
      res.json(hr);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
};

export default hrController; 