import { SectionService } from '../services/sectionService.js';

export class SectionController {
  static async createSection(req, res, next) {
    try {
      const { id: courseId } = req.params;
      const { title, order } = req.body;
      const section = await SectionService.createSection(courseId, { title, order });
      return res.status(201).json(section);
    } catch (error) {
      next(error);
    }
  }
}
