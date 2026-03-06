import 'dart:convert';
import 'package:flutter/services.dart' show rootBundle;
import '../utils/course_expansion.dart';
import '../features/courses/data/course_repository.dart';

// Note: Course and CourseChapter are now imported from course_repository.dart
// to avoid type mismatch errors.

class CoursesData {
  static Future<List<Course>> loadAll() => Course.loadAll();
}
