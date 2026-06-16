import {
  pgTable,
  serial,
  text,
  boolean,
  timestamp,
  integer,
  numeric,
  jsonb,
  uniqueIndex,
  index,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ─── Enums ────────────────────────────────────────────────────────────────────

export const roleEnum = pgEnum("role", [
  "super_admin",
  "admin",
  "instructor",
  "student",
]);

export const providerEnum = pgEnum("auth_provider", ["manual", "google"]);

export const questionTypeEnum = pgEnum("question_type", [
  "multiple_choice",
  "short_answer",
  "true_false",
  "matching",
]);

export const attemptStatusEnum = pgEnum("attempt_status", [
  "pending",
  "completed",
  "abandoned",
]);

export const resourceContentTypeEnum = pgEnum("resource_content_type", [
  "file",
  "url",
]);

export const visibilityEnum = pgEnum("visibility", ["private", "public"]);

// ─── Tables ───────────────────────────────────────────────────────────────────

export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    password: text("password"),
    role: roleEnum("role").notNull().default("student"),
    verified: boolean("verified").notNull().default(false),
    verificationToken: text("verification_token"),
    provider: providerEnum("provider").notNull().default("manual"),
    uid: text("uid"),
    resetToken: text("reset_token"),
    resetTokenExpires: timestamp("reset_token_expires"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("users_email_idx").on(t.email),
    index("users_role_idx").on(t.role),
  ]
);

export const assessments = pgTable(
  "assessments",
  {
    id: serial("id").primaryKey(),
    title: text("title").notNull(),
    prompt: text("prompt"),
    externalLinks: jsonb("external_links").$type<string[]>(),
    instructorId: integer("instructor_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    isExecuted: boolean("is_executed").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [index("assessments_instructor_idx").on(t.instructorId)]
);

export const questionBlocks = pgTable(
  "question_blocks",
  {
    id: serial("id").primaryKey(),
    assessmentId: integer("assessment_id")
      .notNull()
      .references(() => assessments.id, { onDelete: "cascade" }),
    questionType: questionTypeEnum("question_type").notNull(),
    questionCount: integer("question_count").notNull().default(5),
    durationPerQuestion: integer("duration_per_question").notNull().default(60),
    numOptions: integer("num_options").default(4),
    leftCount: integer("left_count").default(3),
    rightCount: integer("right_count").default(4),
    positiveMarks: numeric("positive_marks", { precision: 5, scale: 2 })
      .notNull()
      .default("1"),
    negativeMarks: numeric("negative_marks", { precision: 5, scale: 2 })
      .notNull()
      .default("0.25"),
    createdBy: integer("created_by").references(() => users.id),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("question_blocks_assessment_idx").on(t.assessmentId)]
);

export const resources = pgTable(
  "resources",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    url: text("url"),
    fileType: text("file_type"),
    fileSize: integer("file_size"),
    visibility: visibilityEnum("visibility").notNull().default("private"),
    contentType: resourceContentTypeEnum("content_type")
      .notNull()
      .default("file"),
    uploadedBy: integer("uploaded_by")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [index("resources_uploaded_by_idx").on(t.uploadedBy)]
);

export const assessmentResources = pgTable(
  "assessment_resources",
  {
    id: serial("id").primaryKey(),
    assessmentId: integer("assessment_id")
      .notNull()
      .references(() => assessments.id, { onDelete: "cascade" }),
    resourceId: integer("resource_id")
      .notNull()
      .references(() => resources.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("assessment_resources_unique_idx").on(
      t.assessmentId,
      t.resourceId
    ),
  ]
);

export const enrollments = pgTable(
  "enrollments",
  {
    id: serial("id").primaryKey(),
    assessmentId: integer("assessment_id")
      .notNull()
      .references(() => assessments.id, { onDelete: "cascade" }),
    studentId: integer("student_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    enrolledAt: timestamp("enrolled_at").notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("enrollments_unique_idx").on(t.assessmentId, t.studentId),
    index("enrollments_student_idx").on(t.studentId),
  ]
);

export const assessmentAttempts = pgTable(
  "assessment_attempts",
  {
    id: serial("id").primaryKey(),
    assessmentId: integer("assessment_id")
      .notNull()
      .references(() => assessments.id, { onDelete: "cascade" }),
    studentId: integer("student_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    startedAt: timestamp("started_at").notNull().defaultNow(),
    completedAt: timestamp("completed_at"),
    score: numeric("score", { precision: 8, scale: 2 }),
    status: attemptStatusEnum("status").notNull().default("pending"),
    attemptNumber: integer("attempt_number").notNull().default(1),
    language: text("language").notNull().default("en"),
  },
  (t) => [
    index("attempts_assessment_idx").on(t.assessmentId),
    index("attempts_student_idx").on(t.studentId),
    index("attempts_status_idx").on(t.status),
    index("attempts_student_status_idx").on(t.studentId, t.status),
  ]
);

export const generatedQuestions = pgTable(
  "generated_questions",
  {
    id: serial("id").primaryKey(),
    attemptId: integer("attempt_id")
      .notNull()
      .references(() => assessmentAttempts.id, { onDelete: "cascade" }),
    questionOrder: integer("question_order").notNull(),
    questionType: questionTypeEnum("question_type").notNull(),
    questionText: text("question_text").notNull(),
    options: jsonb("options").$type<string[]>(),
    correctAnswer: text("correct_answer").notNull(),
    positiveMarks: numeric("positive_marks", { precision: 5, scale: 2 })
      .notNull()
      .default("1"),
    negativeMarks: numeric("negative_marks", { precision: 5, scale: 2 })
      .notNull()
      .default("0.25"),
    durationPerQuestion: integer("duration_per_question")
      .notNull()
      .default(60),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    index("gen_questions_attempt_idx").on(t.attemptId),
    index("gen_questions_order_idx").on(t.attemptId, t.questionOrder),
  ]
);

export const studentAnswers = pgTable(
  "student_answers",
  {
    id: serial("id").primaryKey(),
    attemptId: integer("attempt_id")
      .notNull()
      .references(() => assessmentAttempts.id, { onDelete: "cascade" }),
    questionId: integer("question_id")
      .notNull()
      .references(() => generatedQuestions.id, { onDelete: "cascade" }),
    studentAnswer: text("student_answer"),
    isCorrect: boolean("is_correct"),
    score: numeric("score", { precision: 5, scale: 2 }),
    submittedAt: timestamp("submitted_at").notNull().defaultNow(),
  },
  (t) => [
    index("student_answers_attempt_idx").on(t.attemptId),
    index("student_answers_question_idx").on(t.questionId),
  ]
);

export const resourceChunks = pgTable(
  "resource_chunks",
  {
    id: serial("id").primaryKey(),
    resourceId: integer("resource_id")
      .notNull()
      .references(() => resources.id, { onDelete: "cascade" }),
    chunkText: text("chunk_text").notNull(),
    embedding: text("embedding"),
    chunkIndex: integer("chunk_index").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("resource_chunks_resource_idx").on(t.resourceId)]
);

export const systemConfigs = pgTable(
  "system_configs",
  {
    id: serial("id").primaryKey(),
    configKey: text("config_key").notNull(),
    configValue: text("config_value"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [uniqueIndex("system_configs_key_idx").on(t.configKey)]
);

// ─── Relations ────────────────────────────────────────────────────────────────

export const usersRelations = relations(users, ({ many }) => ({
  assessments: many(assessments),
  enrollments: many(enrollments),
  attempts: many(assessmentAttempts),
  resources: many(resources),
}));

export const assessmentsRelations = relations(assessments, ({ one, many }) => ({
  instructor: one(users, {
    fields: [assessments.instructorId],
    references: [users.id],
  }),
  questionBlocks: many(questionBlocks),
  enrollments: many(enrollments),
  attempts: many(assessmentAttempts),
  assessmentResources: many(assessmentResources),
}));

export const enrollmentsRelations = relations(enrollments, ({ one }) => ({
  assessment: one(assessments, {
    fields: [enrollments.assessmentId],
    references: [assessments.id],
  }),
  student: one(users, {
    fields: [enrollments.studentId],
    references: [users.id],
  }),
}));

export const attemptsRelations = relations(
  assessmentAttempts,
  ({ one, many }) => ({
    assessment: one(assessments, {
      fields: [assessmentAttempts.assessmentId],
      references: [assessments.id],
    }),
    student: one(users, {
      fields: [assessmentAttempts.studentId],
      references: [users.id],
    }),
    questions: many(generatedQuestions),
    answers: many(studentAnswers),
  })
);

export const resourcesRelations = relations(resources, ({ one, many }) => ({
  uploader: one(users, {
    fields: [resources.uploadedBy],
    references: [users.id],
  }),
  chunks: many(resourceChunks),
  assessmentResources: many(assessmentResources),
}));

// ─── Inferred types ───────────────────────────────────────────────────────────

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Assessment = typeof assessments.$inferSelect;
export type NewAssessment = typeof assessments.$inferInsert;
export type QuestionBlock = typeof questionBlocks.$inferSelect;
export type NewQuestionBlock = typeof questionBlocks.$inferInsert;
export type Resource = typeof resources.$inferSelect;
export type NewResource = typeof resources.$inferInsert;
export type Enrollment = typeof enrollments.$inferSelect;
export type AssessmentAttempt = typeof assessmentAttempts.$inferSelect;
export type NewAssessmentAttempt = typeof assessmentAttempts.$inferInsert;
export type GeneratedQuestion = typeof generatedQuestions.$inferSelect;
export type NewGeneratedQuestion = typeof generatedQuestions.$inferInsert;
export type StudentAnswer = typeof studentAnswers.$inferSelect;
export type SystemConfig = typeof systemConfigs.$inferSelect;
