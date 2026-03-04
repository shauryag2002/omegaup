import course_ViewStudent from '../components/course/ViewStudent.vue';
import { OmegaUp } from '../omegaup';
import { types } from '../api_types';
import * as api from '../api';
import * as ui from '../ui';
import T from '../lang';
import { createApp, h, reactive } from 'vue';

OmegaUp.on('ready', () => {
  const payload = types.payloadParsers.StudentProgressByAssignmentPayload();

  const match = /#(?<alias>[^/]+)?/g.exec(window.location.hash);
  const selectedProblem = match?.groups?.alias;

  const student = payload.students.find(
    (student) => payload.student === student.username,
  );

  const assignment = payload.course.assignments.find(
    (assignment) => payload.assignment === assignment.alias,
  );

  const problem = payload.problems.find(
    (problem) => selectedProblem === problem.alias,
  );

  const problems: types.CourseProblem[] = payload.problems;

  const state = reactive({
    problems,
    problem,
  });

  const methods = {
    refreshStudentProgress: (
      student: string,
      assignmentAlias: string,
    ): void => {
      if (assignmentAlias == null) return;
      api.Course.studentProgress({
        course_alias: payload.course.alias,
        assignment_alias: assignmentAlias,
        usernameOrEmail: student,
      })
        .then((data) => {
          state.problems = data.problems;
        })
        .catch(ui.apiError);
    },
  };

  const app = createApp({
    methods,
    render: () =>
      h(course_ViewStudent, {
        assignments: payload.course.assignments,
        course: payload.course,
        student,
        assignment,
        problem,
        problems: state.problems,
        students: payload.students,
        onSetFeedback: ({
          guid,
          feedback,
          isUpdate,
          assignmentAlias,
          studentUsername,
        }: {
          guid: string;
          feedback: string;
          isUpdate: boolean;
          assignmentAlias: string;
          studentUsername: string;
        }) => {
          api.Submission.setFeedback({
            guid,
            course_alias: payload.course.alias,
            assignment_alias: assignmentAlias,
            feedback,
          })
            .then(() => {
              ui.success(
                isUpdate
                  ? T.feedbackSuccessfullyUpdated
                  : T.feedbackSuccessfullyAdded,
              );
              methods.refreshStudentProgress(studentUsername, assignmentAlias);
              api.Course.studentProgress({
                course_alias: payload.course.alias,
                assignment_alias: assignmentAlias,
                usernameOrEmail: studentUsername,
              })
                .then((data) => {
                  state.problems = data.problems;
                })
                .catch(ui.apiError);
            })
            .catch(ui.error);
        },
        update: ({
          student,
          assignmentAlias,
        }: {
          student: string;
          assignmentAlias: string;
        }) => {
          methods.refreshStudentProgress(student, assignmentAlias);
        },
        onPushState: (student: string, title: string, url: string) => {
          window.history.pushState(student, title, url);
        },
      }),
  });
  app.mount('#main-container');
});
