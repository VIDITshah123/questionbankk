/**
 * Question Bank API Routes
 * Created: 2025-07-30
 */

const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { authenticateToken } = require('../../middleware/auth');
const { checkPermissions } = require('../../middleware/rbac');
const { dbMethods } = require('../../modules/database/backend');

// Helper function to handle database errors
const handleDBError = (err, res) => {
  console.error('Database error:', err);
  res.status(500).json({ 
    success: false, 
    message: 'Database operation failed',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
};

/**
 * COMPANIES ROUTES
 */

// Get all companies
router.get('/companies', [authenticateToken], async (req, res) => {
  try {
    const companies = await dbMethods.all('SELECT * FROM qb_master_companies WHERE is_active = 1');
    res.json({ success: true, data: companies });
  } catch (err) {
    handleDBError(err, res);
  }
});

// Create a new company
router.post('/companies', [
  authenticateToken,
  body('company_name').notEmpty().withMessage('Company name is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { company_name, company_gst_number, company_city, company_state, company_country, company_pincode, company_address } = req.body;
    
    const result = await dbMethods.run(
      'INSERT INTO qb_master_companies (company_name, company_gst_number, company_city, company_state, company_country, company_pincode, company_address) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [company_name, company_gst_number, company_city, company_state, company_country, company_pincode, company_address]
    );

    res.status(201).json({ 
      success: true, 
      message: 'Company created successfully',
      company_id: result.lastID 
    });
  } catch (err) {
    handleDBError(err, res);
  }
});

// Update a company
router.put('/companies/:id', [
  authenticateToken,
  body('company_name').optional().notEmpty().withMessage('Company name cannot be empty')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const companyId = req.params.id;
    const { company_name, company_gst_number, company_city, company_state, company_country, company_pincode, company_address, is_active } = req.body;
    
    const updates = [];
    const params = [];
    
    if (company_name !== undefined) { updates.push('company_name = ?'); params.push(company_name); }
    if (company_gst_number !== undefined) { updates.push('company_gst_number = ?'); params.push(company_gst_number); }
    if (company_city !== undefined) { updates.push('company_city = ?'); params.push(company_city); }
    if (company_state !== undefined) { updates.push('company_state = ?'); params.push(company_state); }
    if (company_country !== undefined) { updates.push('company_country = ?'); params.push(company_country); }
    if (company_pincode !== undefined) { updates.push('company_pincode = ?'); params.push(company_pincode); }
    if (company_address !== undefined) { updates.push('company_address = ?'); params.push(company_address); }
    if (is_active !== undefined) { updates.push('is_active = ?'); params.push(is_active ? 1 : 0); }
    
    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: 'No valid fields provided for update' });
    }
    
    updates.push('updated_at = CURRENT_TIMESTAMP');
    
    const query = `UPDATE qb_master_companies SET ${updates.join(', ')} WHERE company_id = ?`;
    params.push(companyId);
    
    const result = await dbMethods.run(query, params);
    
    if (result.changes === 0) {
      return res.status(404).json({ success: false, message: 'Company not found' });
    }
    
    res.json({ success: true, message: 'Company updated successfully' });
  } catch (err) {
    handleDBError(err, res);
  }
});

// Delete a company (soft delete)
router.delete('/companies/:id', [authenticateToken], async (req, res) => {
  try {
    const result = await dbMethods.run(
      'UPDATE qb_master_companies SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE company_id = ?',
      [req.params.id]
    );
    
    if (result.changes === 0) {
      return res.status(404).json({ success: false, message: 'Company not found' });
    }
    
    res.json({ success: true, message: 'Company deleted successfully' });
  } catch (err) {
    handleDBError(err, res);
  }
});

/**
 * EMPLOYEES ROUTES
 */

// Get all employees
router.get('/employees', [authenticateToken], async (req, res) => {
  try {
    const employees = await dbMethods.all('SELECT * FROM qb_master_employees WHERE is_active = 1');
    res.json({ success: true, data: employees });
  } catch (err) {
    handleDBError(err, res);
  }
});

// Create a new employee
router.post('/employees', [
  authenticateToken,
  body('employee_name').notEmpty().withMessage('Employee name is required'),
  body('employee_email').isEmail().withMessage('Valid email is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { employee_name, employee_email } = req.body;
    
    const result = await dbMethods.run(
      'INSERT INTO qb_master_employees (employee_name, employee_email) VALUES (?, ?)',
      [employee_name, employee_email]
    );

    res.status(201).json({ 
      success: true, 
      message: 'Employee created successfully',
      employee_id: result.lastID 
    });
  } catch (err) {
    handleDBError(err, res);
  }
});

// Update an employee
router.put('/employees/:id', [
  authenticateToken,
  body('employee_name').optional().notEmpty().withMessage('Employee name cannot be empty'),
  body('employee_email').optional().isEmail().withMessage('Valid email is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const employeeId = req.params.id;
    const { employee_name, employee_email, is_active } = req.body;
    
    const updates = [];
    const params = [];
    
    if (employee_name !== undefined) { updates.push('employee_name = ?'); params.push(employee_name); }
    if (employee_email !== undefined) { updates.push('employee_email = ?'); params.push(employee_email); }
    if (is_active !== undefined) { updates.push('is_active = ?'); params.push(is_active ? 1 : 0); }
    
    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: 'No valid fields provided for update' });
    }
    
    updates.push('updated_at = CURRENT_TIMESTAMP');
    
    const query = `UPDATE qb_master_employees SET ${updates.join(', ')} WHERE employee_id = ?`;
    params.push(employeeId);
    
    const result = await dbMethods.run(query, params);
    
    if (result.changes === 0) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }
    
    res.json({ success: true, message: 'Employee updated successfully' });
  } catch (err) {
    handleDBError(err, res);
  }
});

// Delete an employee (soft delete)
router.delete('/employees/:id', [authenticateToken], async (req, res) => {
  try {
    const result = await dbMethods.run(
      'UPDATE qb_master_employees SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE employee_id = ?',
      [req.params.id]
    );
    
    if (result.changes === 0) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }
    
    res.json({ success: true, message: 'Employee deleted successfully' });
  } catch (err) {
    handleDBError(err, res);
  }
});

/**
 * QUESTIONS ROUTES
 */

// Get all questions with filters
router.get('/questions', [authenticateToken], async (req, res) => {
  try {
    const { category_id, subcategory_id, difficulty, type, limit = 100, offset = 0 } = req.query;
    
    let query = 'SELECT * FROM qb_master_questions WHERE is_active = 1';
    const params = [];
    
    if (category_id) {
      query += ' AND category_id = ?';
      params.push(category_id);
    }
    
    if (subcategory_id) {
      query += ' AND subcategory_id = ?';
      params.push(subcategory_id);
    }
    
    if (difficulty) {
      query += ' AND difficulty_level = ?';
      params.push(difficulty);
    }
    
    if (type) {
      query += ' AND question_type = ?';
      params.push(type);
    }
    
    query += ' LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));
    
    const questions = await dbMethods.all(query, params);
    res.json({ success: true, data: questions });
  } catch (err) {
    handleDBError(err, res);
  }
});

// Create a new question
router.post('/questions', [
  authenticateToken,
  body('question_text').notEmpty().withMessage('Question text is required'),
  body('question_writer_id').isInt().withMessage('Valid writer ID is required'),
  body('question_type').optional().isIn(['mcq', 'true_false']).withMessage('Invalid question type'),
  body('difficulty_level').optional().isIn(['easy', 'medium', 'hard']).withMessage('Invalid difficulty level')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { 
      question_text, 
      question_writer_id, 
      category_id, 
      subcategory_id, 
      question_type = 'mcq', 
      question_instructions, 
      difficulty_level 
    } = req.body;
    
    const result = await dbMethods.run(
      `INSERT INTO qb_master_questions 
       (question_text, question_writer_id, category_id, subcategory_id, question_type, question_instructions, difficulty_level) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [question_text, question_writer_id, category_id, subcategory_id, question_type, question_instructions, difficulty_level]
    );

    // If options are provided for MCQ, add them
    if (question_type === 'mcq' && Array.isArray(req.body.options)) {
      const questionId = result.lastID;
      const options = req.body.options;
      
      for (const option of options) {
        await dbMethods.run(
          'INSERT INTO qb_question_answer_options (question_id, option_text, is_correct, option_order) VALUES (?, ?, ?, ?)',
          [questionId, option.text, option.is_correct || false, option.order || 0]
        );
      }
    }

    res.status(201).json({ 
      success: true, 
      message: 'Question created successfully',
      question_id: result.lastID 
    });
  } catch (err) {
    handleDBError(err, res);
  }
});

// Get question by ID with options
router.get('/questions/:id', [authenticateToken], async (req, res) => {
  try {
    const question = await dbMethods.get(
      'SELECT * FROM qb_master_questions WHERE question_id = ? AND is_active = 1',
      [req.params.id]
    );
    
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }
    
    // Get options if question is MCQ
    if (question.question_type === 'mcq') {
      const options = await dbMethods.all(
        'SELECT * FROM qb_question_answer_options WHERE question_id = ? ORDER BY option_order',
        [question.question_id]
      );
      question.options = options;
    }
    
    res.json({ success: true, data: question });
  } catch (err) {
    handleDBError(err, res);
  }
});

// Update a question
router.put('/questions/:id', [
  authenticateToken,
  body('question_text').optional().notEmpty().withMessage('Question text cannot be empty'),
  body('question_type').optional().isIn(['mcq', 'true_false']).withMessage('Invalid question type'),
  body('difficulty_level').optional().isIn(['easy', 'medium', 'hard']).withMessage('Invalid difficulty level')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const questionId = req.params.id;
    const { 
      question_text, 
      category_id, 
      subcategory_id, 
      question_type, 
      question_instructions, 
      difficulty_level,
      options
    } = req.body;
    
    // Build dynamic update query
    const updates = [];
    const params = [];
    
    if (question_text !== undefined) { updates.push('question_text = ?'); params.push(question_text); }
    if (category_id !== undefined) { updates.push('category_id = ?'); params.push(category_id); }
    if (subcategory_id !== undefined) { updates.push('subcategory_id = ?'); params.push(subcategory_id); }
    if (question_type !== undefined) { updates.push('question_type = ?'); params.push(question_type); }
    if (question_instructions !== undefined) { updates.push('question_instructions = ?'); params.push(question_instructions); }
    if (difficulty_level !== undefined) { updates.push('difficulty_level = ?'); params.push(difficulty_level); }
    
    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: 'No valid fields provided for update' });
    }
    
    updates.push('updated_at = CURRENT_TIMESTAMP');
    
    const query = `UPDATE qb_master_questions SET ${updates.join(', ')} WHERE question_id = ?`;
    params.push(questionId);
    
    const result = await dbMethods.run(query, params);
    
    if (result.changes === 0) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }
    
    // Update options if provided
    if (Array.isArray(options)) {
      // Delete existing options
      await dbMethods.run('DELETE FROM qb_question_answer_options WHERE question_id = ?', [questionId]);
      
      // Insert new options
      for (const option of options) {
        await dbMethods.run(
          'INSERT INTO qb_question_answer_options (question_id, option_text, is_correct, option_order) VALUES (?, ?, ?, ?)',
          [questionId, option.text, option.is_correct || false, option.order || 0]
        );
      }
    }
    
    res.json({ success: true, message: 'Question updated successfully' });
  } catch (err) {
    handleDBError(err, res);
  }
});

// Delete a question (soft delete)
router.delete('/questions/:id', [authenticateToken], async (req, res) => {
  try {
    const result = await dbMethods.run(
      'UPDATE qb_master_questions SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE question_id = ?',
      [req.params.id]
    );
    
    if (result.changes === 0) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }
    
    res.json({ success: true, message: 'Question deleted successfully' });
  } catch (err) {
    handleDBError(err, res);
  }
});

/**
 * CATEGORIES ROUTES
 */

// Get all categories
router.get('/categories', [authenticateToken], async (req, res) => {
  try {
    const categories = await dbMethods.all('SELECT * FROM qb_master_categories');
    res.json({ success: true, data: categories });
  } catch (err) {
    handleDBError(err, res);
  }
});

// Create a new category
router.post('/categories', [
  authenticateToken,
  body('category_name').notEmpty().withMessage('Category name is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { category_name, category_description } = req.body;
    
    const result = await dbMethods.run(
      'INSERT INTO qb_master_categories (category_name, category_description) VALUES (?, ?)',
      [category_name, category_description]
    );

    res.status(201).json({ 
      success: true, 
      message: 'Category created successfully',
      category_id: result.lastID 
    });
  } catch (err) {
    handleDBError(err, res);
  }
});

// Update a category
router.put('/categories/:id', [
  authenticateToken,
  body('category_name').optional().notEmpty().withMessage('Category name cannot be empty')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const categoryId = req.params.id;
    const { category_name, category_description } = req.body;
    
    const updates = [];
    const params = [];
    
    if (category_name !== undefined) { updates.push('category_name = ?'); params.push(category_name); }
    if (category_description !== undefined) { updates.push('category_description = ?'); params.push(category_description); }
    
    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: 'No valid fields provided for update' });
    }
    
    const query = `UPDATE qb_master_categories SET ${updates.join(', ')} WHERE category_id = ?`;
    params.push(categoryId);
    
    const result = await dbMethods.run(query, params);
    
    if (result.changes === 0) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    
    res.json({ success: true, message: 'Category updated successfully' });
  } catch (err) {
    handleDBError(err, res);
  }
});

// Delete a category
router.delete('/categories/:id', [authenticateToken], async (req, res) => {
  try {
    // Check if category has subcategories
    const subcategories = await dbMethods.all(
      'SELECT COUNT(*) as count FROM qb_master_subcategories WHERE category_id = ?',
      [req.params.id]
    );
    
    if (subcategories[0].count > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot delete category with existing subcategories' 
      });
    }
    
    // Check if category is used in questions
    const questions = await dbMethods.all(
      'SELECT COUNT(*) as count FROM qb_master_questions WHERE category_id = ? AND is_active = 1',
      [req.params.id]
    );
    
    if (questions[0].count > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot delete category that is being used by questions' 
      });
    }
    
    // If no dependencies, delete the category
    const result = await dbMethods.run(
      'DELETE FROM qb_master_categories WHERE category_id = ?',
      [req.params.id]
    );
    
    if (result.changes === 0) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    
    res.json({ success: true, message: 'Category deleted successfully' });
  } catch (err) {
    handleDBError(err, res);
  }
});

/**
 * SUBCATEGORIES ROUTES
 */

// Get all subcategories for a category
router.get('/categories/:categoryId/subcategories', [authenticateToken], async (req, res) => {
  try {
    const subcategories = await dbMethods.all(
      'SELECT * FROM qb_master_subcategories WHERE category_id = ?',
      [req.params.categoryId]
    );
    
    res.json({ success: true, data: subcategories });
  } catch (err) {
    handleDBError(err, res);
  }
});

// Create a new subcategory
router.post('/categories/:categoryId/subcategories', [
  authenticateToken,
  body('subcategory_name').notEmpty().withMessage('Subcategory name is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { subcategory_name, subcategory_description } = req.body;
    const category_id = req.params.categoryId;
    
    const result = await dbMethods.run(
      'INSERT INTO qb_master_subcategories (category_id, subcategory_name, subcategory_description) VALUES (?, ?, ?)',
      [category_id, subcategory_name, subcategory_description]
    );

    res.status(201).json({ 
      success: true, 
      message: 'Subcategory created successfully',
      subcategory_id: result.lastID 
    });
  } catch (err) {
    handleDBError(err, res);
  }
});

// Update a subcategory
router.put('/subcategories/:id', [
  authenticateToken,
  body('subcategory_name').optional().notEmpty().withMessage('Subcategory name cannot be empty')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const subcategoryId = req.params.id;
    const { subcategory_name, subcategory_description } = req.body;
    
    const updates = [];
    const params = [];
    
    if (subcategory_name !== undefined) { updates.push('subcategory_name = ?'); params.push(subcategory_name); }
    if (subcategory_description !== undefined) { updates.push('subcategory_description = ?'); params.push(subcategory_description); }
    
    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: 'No valid fields provided for update' });
    }
    
    const query = `UPDATE qb_master_subcategories SET ${updates.join(', ')} WHERE subcategory_id = ?`;
    params.push(subcategoryId);
    
    const result = await dbMethods.run(query, params);
    
    if (result.changes === 0) {
      return res.status(404).json({ success: false, message: 'Subcategory not found' });
    }
    
    res.json({ success: true, message: 'Subcategory updated successfully' });
  } catch (err) {
    handleDBError(err, res);
  }
});

// Delete a subcategory
router.delete('/subcategories/:id', [authenticateToken], async (req, res) => {
  try {
    // Check if subcategory is used in questions
    const questions = await dbMethods.all(
      'SELECT COUNT(*) as count FROM qb_master_questions WHERE subcategory_id = ? AND is_active = 1',
      [req.params.id]
    );
    
    if (questions[0].count > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot delete subcategory that is being used by questions' 
      });
    }
    
    // If no dependencies, delete the subcategory
    const result = await dbMethods.run(
      'DELETE FROM qb_master_subcategories WHERE subcategory_id = ?',
      [req.params.id]
    );
    
    if (result.changes === 0) {
      return res.status(404).json({ success: false, message: 'Subcategory not found' });
    }
    
    res.json({ success: true, message: 'Subcategory deleted successfully' });
  } catch (err) {
    handleDBError(err, res);
  }
});

module.exports = router;
