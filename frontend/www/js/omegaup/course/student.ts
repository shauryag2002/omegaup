import course_ViewStudent from '../components/course/ViewStudent.vue';
import { OmegaUp } from '../omegaup';
import { types } from '../api_types';
import * as api from '../api';
import * as ui from '../ui';
import T from '../lang';
import { createApp, h, reactive } from 'vue';

OmegaUp.on('ready', () => {
  const payload = types.payloadParsers.StudentProgressPayload();

  const student = payload.students.find(
    (student) => payload.student === student.username,
  );

  const state = reactive({
    problems: [] as types.CourseProblem[],
    problem: null as null | types.CourseProblem,
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
        problems: state.problems,
        problem: state.problem,
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
              state.refreshStudentProgress(studentUsername, assignmentAlias);
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
          state.refreshStudentProgress(student, assignmentAlias);
        },
        onPushState: (student: string, title: string, url: string) => {
          window.history.pushState(student, title, url);
        },
      }),
  });
  app.mount('#main-container');
});
