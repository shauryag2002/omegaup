<template>
  <form
    role="form"
    class="card-body"
    @submit.prevent="onUpdateUserBasicInformation"
  >
    <div class="form-group">
      <label>{{ T.username }}</label>
      <input
        v-model="username"
        data-username
        class="form-control"
        :class="{ 'is-invalid': !isValidUsername }"
      />
      <div v-if="!isValidUsername" class="invalid-feedback">
        {{ T.parameterInvalidAlias }}
      </div>
    </div>
    <div class="form-group">
      <label>{{ T.wordsName }}</label>
      <input v-model="name" data-name class="form-control" />
    </div>
    <div class="form-group">
      <label>{{ T.wordsGender }}</label>
      <select v-model="gender" data-gender class="custom-select">
        <option value="female">{{ T.wordsGenderFemale }}</option>
        <option value="male">{{ T.wordsGenderMale }}</option>
        <option value="other">{{ T.wordsGenderOther }}</option>
        <option value="decline">{{ T.wordsGenderDecline }}</option>
      </select>
    </div>
    <div class="form-group">
      <label>{{ T.wordsCountry }}</label>
      <select v-model="countryId" data-countries class="custom-select">
        <option value=""></option>
        <option
          v-for="country in countries"
          :key="country.country_id"
          :value="country.country_id"
        >
          {{ country.country_id === 'xx' ? T.countryNotSet : country.name }}
        </option>
      </select>
    </div>
    <div class="form-group">
      <label>{{ T.profileState }}</label>
      <select
        v-model="stateId"
        data-states
        :disabled="!isCountrySelected"
        class="custom-select"
      >
        <option
          v-for="[code, state] in Object.entries(countryStates)"
          :key="code"
          :value="code.split('-')[1]"
        >
          {{ state.name }}
        </option>
      </select>
    </div>
    <div class="form-group" data-date-of-birth>
      <label>{{ T.userEditBirthDate }}</label>
      <omegaup-datepicker
        v-model="birthDate"
        :required="false"
        :max="new Date()"
      ></omegaup-datepicker>
    </div>
    <div class="mt-3">
      <button
        type="submit"
        class="btn btn-primary mr-2"
        data-save-profile-changes-button
        :class="{ disabled: !hasChanges }"
        :disabled="!hasChanges"
      >
        {{ T.wordsSaveChanges }}
      </button>
      <a href="/profile/" class="btn btn-cancel">{{ T.wordsCancel }}</a>
    </div>
  </form>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch, PropType } from 'vue';
import { dao, types } from '../../api_types';
import T from '../../lang';
import * as time from '../../time';
import * as iso3166 from '@/third_party/js/iso-3166-2.js/iso3166.min.js';
import DatePicker from '../DatePicker.vue';

export default defineComponent({
  name: 'UserBasicInformationEdit',
  components: {
    'omegaup-datepicker': DatePicker,
  },
  props: {
    data: {
      type: Object as PropType<types.UserProfileDetailsPayload>,
      required: true,
    },
    countries: {
      type: Array as PropType<dao.Countries[]>,
      required: true,
    },
    profile: {
      type: Object as PropType<types.UserProfileInfo>,
      required: true,
    },
  },
  emits: [
    'update-user-basic-information-error',
    'update-user-basic-information',
  ],
  setup(props, { emit }) {
    const username = ref(props.profile.username);
    const name = ref(props.profile.name);
    const gender = ref(props.profile.gender);
    const countryId = ref<string | null>(props.profile.country_id ?? null);
    const stateId = ref<string | null>(props.profile.state_id ?? null);
    const birthDate = ref(
      props.profile.birth_date
        ? time.convertLocalDateToGMTDate(props.profile.birth_date)
        : new Date(''),
    );

    const isCountrySelected = computed((): boolean => {
      return Boolean(countryId.value);
    });

    const countryStates = computed((): iso3166.Subdivisions => {
      const id = countryId.value;
      if (!id) {
        return {};
      }
      const countrySelected = iso3166.country(id);
      const subdivisions: iso3166.Subdivisions = Object.entries(
        countrySelected.sub,
      )
        .sort((a, b) => Intl.Collator().compare(a[0], b[0]))
        .reduce((r, [code, name]: any) => ({ ...r, [code]: name }), {});
      return subdivisions;
    });

    const isValidUsername = computed((): boolean => {
      if (!username.value || username.value.length < 2) {
        return false;
      }
      // Using the same regex pattern as the server
      return !/[^a-zA-Z0-9_.-]/.test(username.value);
    });

    const hasChanges = computed((): boolean => {
      return (
        username.value !== props.profile.username ||
        name.value !== props.profile.name ||
        gender.value !== props.profile.gender ||
        countryId.value !== (props.profile.country_id ?? null) ||
        stateId.value !== (props.profile.state_id ?? null) ||
        birthDate.value.getTime() !==
          (props.profile.birth_date
            ? time.convertLocalDateToGMTDate(props.profile.birth_date).getTime()
            : new Date('').getTime())
      );
    });

    function onUpdateUserBasicInformation(): void {
      if (!isValidUsername.value) {
        emit('update-user-basic-information-error', {
          description: T.parameterInvalidAlias,
        });
        return;
      }

      if (name.value && name.value.length > 50) {
        emit('update-user-basic-information-error', {
          description: T.userEditNameTooLong,
        });
        return;
      }

      // Ensure birthDate is converted to a UTC Date object or set to null if invalid
      // Otherwise, timezone discrepancies may cause incorrect DOB display.
      // See bug report: https://github.com/omegaup/omegaup/issues/7478

      const formattedBirthDate = birthDate.value
        ? new Date(
            Date.UTC(
              birthDate.value.getFullYear(),
              birthDate.value.getMonth(),
              birthDate.value.getDate(),
            ),
          )
        : null;

      emit('update-user-basic-information', {
        username: username.value,
        name: name.value,
        gender: gender.value,
        country_id: countryId.value,
        state_id: stateId.value,
        birth_date: formattedBirthDate,
      });
    }

    watch(countryId, (newCountryId: string | null): void => {
      if (!newCountryId) {
        countryId.value = null;
        stateId.value = null;
        return;
      }
      stateId.value = Object.keys(countryStates.value)[0].split('-')[1];
    });

    return {
      T,
      username,
      name,
      gender,
      countryId,
      stateId,
      birthDate,
      isCountrySelected,
      countryStates,
      isValidUsername,
      hasChanges,
      onUpdateUserBasicInformation,
    };
  },
});
</script>
