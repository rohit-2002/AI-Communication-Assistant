import express from 'express';
import knowledgeBase from '../services/knowledgeBase.js';

const router = express.Router();

// GET /api/knowledge-base/search - Search knowledge base
router.get('/search', async (req, res) => {
    try {
        const { query } = req.query;

        if (!query) {
            return res.status(400).json({
                success: false,
                error: 'Query parameter is required'
            });
        }

        const results = knowledgeBase.searchKnowledge(query);

        res.json({
            success: true,
            data: results,
            count: results.length,
            query: query
        });
    } catch (error) {
        console.error('Error searching knowledge base:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to search knowledge base',
            message: error.message
        });
    }
});

// GET /api/knowledge-base/categories - Get all categories
router.get('/categories', async (req, res) => {
    try {
        const categories = knowledgeBase.getCategories();

        res.json({
            success: true,
            data: categories,
            count: categories.length
        });
    } catch (error) {
        console.error('Error getting categories:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get categories',
            message: error.message
        });
    }
});

// POST /api/knowledge-base/find-relevant - Find relevant knowledge for email
router.post('/find-relevant', async (req, res) => {
    try {
        const { subject, body } = req.body;

        if (!subject || !body) {
            return res.status(400).json({
                success: false,
                error: 'Subject and body are required'
            });
        }

        const relevantKnowledge = knowledgeBase.findRelevantKnowledge(subject, body);
        const context = knowledgeBase.getContextForAI(subject, body);
        const solutions = knowledgeBase.getSuggestedSolutions(subject, body);

        res.json({
            success: true,
            data: {
                relevantKnowledge,
                context,
                suggestedSolutions: solutions,
                emailSubject: subject
            }
        });
    } catch (error) {
        console.error('Error finding relevant knowledge:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to find relevant knowledge',
            message: error.message
        });
    }
});

// POST /api/knowledge-base/add - Add new knowledge
router.post('/add', async (req, res) => {
    try {
        const { category, keywords, context, solutions } = req.body;

        if (!category || !keywords || !context) {
            return res.status(400).json({
                success: false,
                error: 'category, keywords, and context are required'
            });
        }

        knowledgeBase.addKnowledge(category, keywords, context, solutions);

        res.json({
            success: true,
            message: `Knowledge added for category: ${category}`,
            data: {
                category,
                keywords,
                solutions: solutions || []
            }
        });
    } catch (error) {
        console.error('Error adding knowledge:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to add knowledge',
            message: error.message
        });
    }
});

// PUT /api/knowledge-base/update/:category - Update existing knowledge
router.put('/update/:category', async (req, res) => {
    try {
        const { category } = req.params;
        const updates = req.body;

        if (!updates || Object.keys(updates).length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Update data is required'
            });
        }

        knowledgeBase.updateKnowledge(category, updates);

        res.json({
            success: true,
            message: `Knowledge updated for category: ${category}`,
            data: {
                category,
                updates
            }
        });
    } catch (error) {
        console.error('Error updating knowledge:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update knowledge',
            message: error.message
        });
    }
});

// GET /api/knowledge-base/category/:category - Get specific category knowledge
router.get('/category/:category', async (req, res) => {
    try {
        const { category } = req.params;
        const categories = knowledgeBase.getCategories();

        if (!categories.includes(category)) {
            return res.status(404).json({
                success: false,
                error: 'Category not found'
            });
        }

        // Access the knowledge base directly for this category
        const knowledge = knowledgeBase.knowledgeBase[category];

        res.json({
            success: true,
            data: {
                category,
                ...knowledge
            }
        });
    } catch (error) {
        console.error('Error getting category knowledge:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get category knowledge',
            message: error.message
        });
    }
});

// GET /api/knowledge-base/all - Get all knowledge base content
router.get('/all', async (req, res) => {
    try {
        const allKnowledge = {};
        const categories = knowledgeBase.getCategories();

        categories.forEach(category => {
            allKnowledge[category] = knowledgeBase.knowledgeBase[category];
        });

        res.json({
            success: true,
            data: allKnowledge,
            categories: categories.length
        });
    } catch (error) {
        console.error('Error getting all knowledge:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get all knowledge',
            message: error.message
        });
    }
});

export default router;