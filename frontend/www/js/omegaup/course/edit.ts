import { omegaup, OmegaUp } from '../omegaup';
import { messages, types } from '../api_types';
import * as api from '../api';
import * as ui from '../ui';
import T from '../lang';
import { createApp, h, reactive } from 'vue';
import course_Edit from '../components/course/Edit.vue';
import { AdmissionMode } from '../components/common/Publish.vue';
import Sortable from 'sortablejs';

OmegaUp.on('ready', () => {
  const payload = types.payloadParsers.CourseEditPayload();
  const courseAlias = payload.course.alias;
  const searchResultEmpty: types.ListItem[] = [];
  const searchResultSchools: types.SchoolListItem[] = [];
  if (payload.course.school_name && payload.course.school_id) {
    searchResultSchools.push({
      key: payload.course.school_id,
      value: payload.course.school_name,
    });
  }

  const state = reactive({
      data: payload,
      initialTab: window.location.hash
        ? window.location.hash.substring(1)
        : 'course',
      invalidParameterName: null as null | string,
      token: '',
      searchResultUsers: searchResultEmpty,
      searchResultProblems: searchResultEmpty,
      searchResultGroups: searchResultEmpty,
      searchResultSchools: searchResultSchools,
    });

  interface CourseEditComponent {
    assignments: types.CourseAssignment[];
    assignmentProblems: types.ProblemsetProblemWithVersions[];
    assignmentFormMode: omegaup.AssignmentFormMode;
    token: string;
    onResetAssignmentForm: () => void;
  }

  let component: CourseEditComponent;

  const methods = {
  
      refreshCourseAdminDetails: (): void => {
        api.Course.adminDetails({ alias: courseAlias }).then((course) => {
          state.data.course = course;
        });
      },
      refreshStudentList: (): void => {
        api.Course.listStudents({ course_alias: courseAlias })
          .then((response) => {
            state.data.students = response.students;
          })
          .catch(ui.apiError);
        api.Course.requests({ course_alias: courseAlias })
          .then((response) => {
            state.data.identityRequests = response.users;
          })
          .catch(ui.apiError);
      },
      refreshAssignmentsList: (): void => {
        api.Course.listAssignments({ course_alias: courseAlias })
          .then((response) => {
            component.assignments = response.assignments;
            component.onResetAssignmentForm();
          })
          .catch(ui.apiError);
      },
      refreshProblemList: (assignment: types.CourseAssignment): void => {
        api.Course.assignmentDetails({
          assignment: assignment.alias,
          course: courseAlias,
        })
          .then((response) => {
            component.assignmentProblems = response.problems;
          })
          .catch(ui.apiError);
      },
      refreshCourseAdminsAndTeachingAssistants: (): void => {
        api.Course.admins({ course_alias: courseAlias })
          .then((response) => {
            state.data.admins = response.admins;
            state.data.groupsAdmins = response.group_admins;
            state.data.teachingAssistants = response.teaching_assistants;
            state.data.groupsTeachingAssistants =
              response.group_teaching_assistants;
          })
          .catch(ui.apiError);
      },
      arbitrateRequest: (username: string, resolution: boolean) => {
        api.Course.arbitrateRequest({
          course_alias: courseAlias,
          username: username,
          resolution: resolution,
          note: '',
        })
          .then(() => {
            if (resolution) {
              ui.success(T.arbitrateRequestAcceptSuccessfully);
            } else {
              ui.success(T.arbitrateRequestDenySuccessfully);
            }
            methods.refreshStudentList();
          })
          .catch(ui.apiError);
      },
    
  };

  const app = createApp({
    methods,
    render: () => h(course_Edit, {
data: state.data,
          initialTab: state.initialTab,
          invalidParameterName: state.invalidParameterName,
          token: state.token,
          searchResultUsers: state.searchResultUsers,
          searchResultProblems: state.searchResultProblems,
          searchResultGroups: state.searchResultGroups,
          searchResultSchools: state.searchResultSchools,
          readOnly: !state.data.course.is_admin && !state.data.course.is_curator,
onUpdateSearchResultGroups: (query: string) => {
            api.Group.list({
              query,
            })
              .then((data) => {
                // Groups previously added into the contest should not be
                // shown in the dropdown
                const addedGroups = new Set(
                  state.data.groupsAdmins.map((group) => group.alias),
                );
                state.searchResultGroups = data
                  .filter((group) => !addedGroups.has(group.value))
                  .map((group) => ({
                    key: group.value,
                    value: `${ui.escape(group.label)} (<strong>${ui.escape(
                      group.value,
                    )}</strong>)`,
                  }));
              })
              .catch(ui.apiError);
          },
          onUpdateSearchResultProblems: (query: string) => {
            api.Problem.listForTypeahead({
              query,
              search_type: 'all',
            })
              .then((data) => {
                // Problems previously added into the assignment should not be
                // shown in the dropdown
                const addedProblems = new Set(
                  component.assignmentProblems.map((problem) => problem.alias),
                );
                state.searchResultProblems = data.results
                  .filter((problem) => !addedProblems.has(problem.key))
                  .map(({ key, value }, index) => ({
                    key,
                    value: `${String(index + 1).padStart(2, '0')}.- ${ui.escape(
                      value,
                    )} (<strong>${ui.escape(key)}</strong>)`,
                  }));
              })
              .catch(ui.apiError);
          },
          onSubmitEditCourse: (request: messages.CourseUpdateRequest) => {
            new Promise<number | null>((accept) => {
              if (request.school.key) {
                accept(request.school.key);
              } else if (request.school.value) {
                api.School.create({ name: request.school.value })
                  .then((response) => {
                    accept(response.school_id);
                  })
                  .catch(ui.apiError);
              } else {
                accept(null);
              }
            })
              .then((schoolId) => {
                if (schoolId) {
                  request.school_id = schoolId;
                }

                api.Course.update(request)
                  .then(() => {
                    ui.success(
                      ui.formatString(T.courseEditCourseEditedAndGoToCourse, {
                        alias: request.alias,
                      }),
                    );
                    state.data.course.name = request.name;
                    window.scrollTo(0, 0);
                    methods.refreshCourseAdminDetails();
                  })
                  .catch(ui.apiError);
              })
              .catch(ui.apiError);
          },
          onAddAssignment: (params: {
            name: string;
            description: string;
            assignment_type: string;
            start_time: Date;
            alias: string;
            course_alias: string;
            problems: types.AddedProblem[];
            finish_time?: Date;
            unlimited_duration?: boolean;
          }) => {
            api.Course.createAssignment(params)
              .then(() => {
                ui.success(T.courseAssignmentAdded);
                state.invalidParameterName = '';
                methods.refreshAssignmentsList();
              })
              .catch((error) => {
                ui.apiError(error);
                component.assignmentFormMode = omegaup.AssignmentFormMode.New;
                state.invalidParameterName = error.parameter || '';
              });
            window.scrollTo(0, 0);
          },
          onUpdateAssignment: (params: {
            name: string;
            description: string;
            assignment_type: string;
            start_time?: Date;
            alias: string;
            course_alias: string;
            problems: types.AddedProblem[];
            finish_time?: Date;
            unlimited_duration?: boolean;
          }) => {
            api.Course.updateAssignment(params)
              .then(() => {
                ui.success(T.courseAssignmentUpdated);
                state.invalidParameterName = '';
                methods.refreshAssignmentsList();
              })
              .catch((error) => {
                ui.apiError(error);
                component.assignmentFormMode = omegaup.AssignmentFormMode.Edit;
                state.invalidParameterName = error.parameter || '';
              });
          },
          onDeleteAssignment: (assignment: types.CourseAssignment) => {
            if (
              !window.confirm(
                ui.formatString(T.courseAssignmentConfirmDelete, {
                  assignment: assignment.name,
                }),
              )
            ) {
              return;
            }
            api.Course.removeAssignment({
              course_alias: courseAlias,
              assignment_alias: assignment.alias,
            })
              .then(() => {
                ui.success(T.courseAssignmentDeleted);
                methods.refreshAssignmentsList();
              })
              .catch(ui.apiError);
          },
          onSortContent: (courseAlias: string, contentAliases: string[]) => {
            api.Course.updateAssignmentsOrder({
              course_alias: courseAlias,
              assignments: JSON.stringify(contentAliases),
            })
              .then(() => {
                ui.success(T.contentOrderUpdated);
              })
              .catch(ui.apiError);
          },
          onGetVersions: ({
            request,
            target,
          }: {
            request: { problemAlias: string; problemsetId: number };
            target: {
              versionLog: types.ProblemVersion[];
              problems: types.ProblemsetProblem[];
              selectedRevision: types.ProblemVersion;
              publishedRevision: types.ProblemVersion;
            };
          }) => {
            api.Problem.versions({
              problem_alias: request.problemAlias,
              problemset_id: request.problemsetId,
            })
              .then((result) => {
                target.versionLog = result.log;
                let publishedCommitHash = result.published;
                for (const problem of target.problems) {
                  if (problem.alias === request.problemAlias) {
                    publishedCommitHash = problem.commit;
                    break;
                  }
                }
                for (const revision of result.log) {
                  if (publishedCommitHash === revision.commit) {
                    target.selectedRevision = target.publishedRevision = revision;
                    break;
                  }
                }
              })
              .catch(ui.apiError);
          },
          onAddProblem: (
            assignment: types.CourseAssignment,
            problem: types.AddedProblem,
          ) => {
            const problemParams: messages.CourseAddProblemRequest = {
              course_alias: courseAlias,
              assignment_alias: assignment.alias,
              problem_alias: problem.alias,
              points: problem.points,
              is_extra_problem: problem.is_extra_problem,
            };
            if (problem.commit) {
              problemParams.commit = problem.commit;
            }
            api.Course.addProblem(problemParams)
              .then((data) => {
                if (assignment.assignment_type == 'lesson') {
                  ui.success(T.courseAssignmentLectureAdded);
                } else {
                  console.log(data.solutionStatus);
                  if (data.solutionStatus === 'not_found') {
                    ui.success(T.courseAssignmentProblemAdded);
                  } else {
                    ui.warning(T.warningPublicSolution);
                  }
                }
                methods.refreshProblemList(assignment);
              })
              .catch(ui.apiError);
          },
          onSelectAssignment: (assignment: types.CourseAssignment) => {
            methods.refreshProblemList(assignment);
          },
          onRemoveProblem: (
            assignment: types.CourseAssignment,
            problem: types.ProblemsetProblem,
          ) => {
            if (
              !window.confirm(
                ui.formatString(T.courseAssignmentProblemConfirmRemove, {
                  problem: problem.title,
                }),
              )
            ) {
              return;
            }
            api.Course.removeProblem({
              course_alias: courseAlias,
              problem_alias: problem.alias,
              assignment_alias: assignment.alias,
            })
              .then(() => {
                if (assignment.assignment_type == 'lesson') {
                  ui.success(T.courseAssignmentLectureRemoved);
                } else {
                  ui.success(T.courseAssignmentProblemRemoved);
                }
                methods.refreshProblemList(assignment);
              })
              .catch(ui.apiError);
          },
          onSortProblems: (
            assignmentAlias: string,
            problemsAliases: string[],
          ) => {
            api.Course.updateProblemsOrder({
              course_alias: courseAlias,
              assignment_alias: assignmentAlias,
              problems: JSON.stringify(problemsAliases),
            })
              .then(() => {
                ui.success(T.problemsOrderUpdated);
              })
              .catch(ui.apiError);
          },
          onTagsProblems: (tags: string[]) => {
            api.Problem.list({ tag: tags.join() })
              .then(() => {
                //state.data.taggedProblems = data.results;
              })
              .catch(ui.apiError);
          },
          onUpdateAdmissionMode: ({
            admissionMode,
            showInPublicCoursesList,
          }: {
            admissionMode: AdmissionMode;
            showInPublicCoursesList: boolean;
          }) => {
            state.data.course.admission_mode = admissionMode;
            api.Course.update({
              alias: courseAlias,
              admission_mode: admissionMode,
              recommended: showInPublicCoursesList,
            })
              .then(() => {
                ui.success(T.courseEditCourseEdited);
                if (admissionMode === AdmissionMode.Registration) {
                  methods.refreshStudentList();
                }
              })
              .catch(ui.apiError);
          },
          onAddStudent: (ev: {
            participant: null | types.ListItem;
            participants: string;
          }) => {
            let participants: string[] = [];
            if (ev.participants) participants = ev.participants.split(/[\n,]/);
            if (ev.participant) participants.push(ev.participant.key);
            if (participants.length === 0) {
              ui.error(T.wordsEmptyAddStudentInput);
              return;
            }
            Promise.allSettled(
              participants.map((participant) =>
                api.Course.addStudent({
                  course_alias: courseAlias,
                  usernameOrEmail: participant.trim(),
                }),
              ),
            )
              .then((results) => {
                const participantsWithError: string[] = [];
                results.forEach((result) => {
                  if (result.status === 'rejected') {
                    participantsWithError.push(result.reason.userEmail);
                  }
                });
                methods.refreshStudentList();
                if (participantsWithError.length === 0) {
                  ui.success(T.courseStudentAdded);
                  return;
                }
                ui.error(
                  ui.formatString(T.bulkUserAddError, {
                    userEmail: participantsWithError.join('<br>'),
                  }),
                );
              })
              .catch(ui.ignoreError);
          },
          onRemoveStudent: (student: types.StudentProgress) => {
            api.Course.removeStudent({
              course_alias: courseAlias,
              usernameOrEmail: student.username,
            })
              .then(() => {
                methods.refreshStudentList();
                ui.success(T.courseStudentRemoved);
              })
              .catch(ui.apiError);
          },
          onAcceptRequest: ({ username }: { username: string }) =>
            methods.arbitrateRequest(username, true),
          onDenyRequest: ({ username }: { username: string }) =>
            methods.arbitrateRequest(username, false),
          onAddAdmin: (useradmin: string) => {
            api.Course.addAdmin({
              course_alias: courseAlias,
              usernameOrEmail: useradmin,
            })
              .then(() => {
                ui.success(T.adminAdded);
                methods.refreshCourseAdminsAndTeachingAssistants();
              })
              .catch(ui.apiError);
          },
          onAddTeachingAssistant: (username: string) => {
            api.Course.addTeachingAssistant({
              course_alias: courseAlias,
              usernameOrEmail: username,
            })
              .then(() => {
                ui.success(T.courseEditTeachingAssistantAddedSuccessfully);
                methods.refreshCourseAdminsAndTeachingAssistants();
              })
              .catch(ui.apiError);
          },
          onRemoveAdmin: (username: string) => {
            api.Course.removeAdmin({
              course_alias: courseAlias,
              usernameOrEmail: username,
            })
              .then(() => {
                methods.refreshCourseAdminsAndTeachingAssistants();
                ui.success(T.adminRemoved);
              })
              .catch(ui.apiError);
          },
          onRemoveTeachingAssistant: (username: string) => {
            api.Course.removeTeachingAssistant({
              course_alias: courseAlias,
              usernameOrEmail: username,
            })
              .then(() => {
                methods.refreshCourseAdminsAndTeachingAssistants();
                ui.success(T.courseEditTeachingAssistantRemovedSuccessfully);
              })
              .catch(ui.apiError);
          },
          onAddGroupAdmin: (groupAlias: string) => {
            api.Course.addGroupAdmin({
              course_alias: courseAlias,
              group: groupAlias,
            })
              .then(() => {
                ui.success(T.groupAdminAdded);
                methods.refreshCourseAdminsAndTeachingAssistants();
              })
              .catch(ui.apiError);
          },
          onAddGroupTeachingAssistant: (groupAlias: string) => {
            api.Course.addGroupTeachingAssistant({
              course_alias: courseAlias,
              group: groupAlias,
            })
              .then(() => {
                ui.success(T.courseEditGroupTeachingAssistantAdded);
                methods.refreshCourseAdminsAndTeachingAssistants();
              })
              .catch(ui.apiError);
          },
          onRemoveGroupAdmin: (groupAlias: string) => {
            api.Course.removeGroupAdmin({
              course_alias: courseAlias,
              group: groupAlias,
            })
              .then(() => {
                methods.refreshCourseAdminsAndTeachingAssistants();
                ui.success(T.groupAdminRemoved);
              })
              .catch(ui.apiError);
          },
          onRemoveGroupTeachingAssistant: (groupAlias: string) => {
            api.Course.removeGroupTeachingAssistant({
              course_alias: courseAlias,
              group: groupAlias,
            })
              .then(() => {
                methods.refreshCourseAdminsAndTeachingAssistants();
                ui.success(T.courseEditGroupTeachingAssistantRemoved);
              })
              .catch(ui.apiError);
          },
          clone: (alias: string, name: string, startTime: Date) => {
            api.Course.clone({
              course_alias: courseAlias,
              name: name,
              alias: alias,
              start_time: startTime.getTime() / 1000,
            })
              .then(() => {
                ui.success(
                  ui.formatString(T.courseEditCourseClonedSuccessfully, {
                    course_alias: alias,
                  }),
                  /*autoHide=*/ false,
                );
              })
              .catch(ui.apiError);
          },
          onGenerateLink: (alias: string) => {
            api.Course.generateTokenForCloneCourse({
              course_alias: alias,
            })
              .then((data) => {
                ui.success(T.courseCloneGenerateLinkSuccess);
                component.token = data.token;
              })
              .catch(ui.apiError);
          },
          onArchiveCourse: (alias: string, archive: boolean) => {
            api.Course.archive({
              course_alias: alias,
              archive,
            })
              .then(() => {
                if (archive) {
                  ui.success(T.courseArchivedSuccess);
                  return;
                }
                ui.success(T.courseUnarchivedSuccess);
              })
              .catch(ui.apiError);
          },
          onUpdateSearchResultUsers: (query: string) => {
            api.User.list({ query })
              .then(({ results }) => {
                state.searchResultUsers = results.map(
                  ({ key, value }: types.ListItem) => ({
                    key,
                    value: `${ui.escape(key)} (<strong>${ui.escape(
                      value,
                    )}</strong>)`,
                  }),
                );
              })
              .catch(ui.apiError);
          },
          onUpdateSearchResultSchools: (query: string) => {
            api.School.list({ query })
              .then(({ results }) => {
                if (!results.length) {
                  state.searchResultSchools = [
                    {
                      key: 0,
                      value: query,
                    },
                  ];
                  return;
                }
                state.searchResultSchools = results.map(
                  ({ key, value }: types.SchoolListItem) => ({
                    key,
                    value,
                  }),
                );
              })
              .catch(ui.apiError);
          },
          onInvalidLanguages: () => {
            ui.error(T.courseNewFormLanguagesRequired);
            state.invalidParameterName = 'languages';
          },
          onClearLanguageError: () => {
            if (state.invalidParameterName === 'languages') {
              state.invalidParameterName = null;
              ui.dismissNotifications();
            }
          },
}),
  });
  app.directive('Sortable', {
    mounted: (el: HTMLElement, binding: { value: Sortable.Options }) => {
      new Sortable(el, binding.value || {});
    },
  });
  component = app.mount('#main-container') as unknown as CourseEditComponent;
});
