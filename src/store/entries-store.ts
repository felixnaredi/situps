import { defineStore } from "pinia";
import { ScheduleDate } from "../interface/schedule-date";
import { Ref, ref, computed } from "vue";
import { InclusiveScheduleDateRange } from "../model/schedule-date-range";
import { io } from "socket.io-client";
import { EntryGetResponse } from "../interface/response";
import { EntryKey } from "../interface/entry-key";

/**
 * Store used to keep track of the state of the entries.
 */
export const useEntriesStore = defineStore("entries", () => {
  //
  // Create socket under the namespace "/entry".
  //
  // TODO:
  //   It would be nice if this could be done via proxy instead.
  const socket = io(`${import.meta.env.SITUPS_WS_URL}/entry`);

  //
  // Respond to established connection.
  //
  socket.on("connect", () => {
    console.log("`useEntriesStore` connected to web-socket");
    socket.emit("acc-connect", { message: "useEntriesStore connected" });
  });

  const scheduleDatesRef: Ref<ScheduleDate[]> = ref([]);

  const scheduleDates = computed(() => scheduleDatesRef.value);

  function setScheduleDateRange(from: ScheduleDate, to: ScheduleDate) {
    scheduleDatesRef.value = Array.from(
      new InclusiveScheduleDateRange(from, to)
    );
  }

  function getEntry(
    entryKey: EntryKey,
    callback: (response: EntryGetResponse) => void
  ) {
    socket.emit("get", { entryKey }, callback);
  }

  return {
    /**
     * Sets the range of scheduled dates.
     */
    setScheduleDateRange,

    /**
     * Gets the data of the entry with identified by `entryKey`.
     *
     * @param entryKey Entry identification.
     * @param callback Handler for the `EntryGetResponse`.
     */
    getEntry,

    /**
     * The scheduled dates of the entries.
     */
    scheduleDates,
  };
});
