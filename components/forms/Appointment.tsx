"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Form } from "@/components/ui/form";
import CustomFormField from "../CustomFormField";
import SubmitButton from "../SubmitButton";
import { Children, useState } from "react";
import {
  CreateAppointmentSchema,
  getAppointmentSchema,
  UserFormValidation,
} from "@/lib/validation";
import { useRouter } from "next/navigation";
import { createUser } from "@/lib/actions/patient.actions";
import { Doctors } from "@/constants";
import { SelectItem } from "../ui/select";
import Image from "next/image";
import {
  createAppointment,
  updateAppointment,
} from "@/lib/actions/appointment.actions";
import { Appointment } from "@/types/appwrite.types";

export enum FormFieldType {
  INPUT = "input",
  TEXTAREA = "textarea",
  PHONE_INPUT = "phoneInput",
  CHECKBOX = "checkbox",
  DATE_PICKER = "datePicker",
  SELECT = "select",
  SKELETON = "skeleton",
}

const AppointmentForm = ({
  userId,
  patientId,
  type,
  appointment,
  setOpen,
}: {
  userId: string;
  patientId: string;
  type: "create" | "cancel" | "schedule";
  appointment?: Appointment;
  setOpen: (open: boolean) => void;
}) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const AppointmentValidation = getAppointmentSchema(type);

  console.log(appointment);

  const form = useForm<z.infer<typeof AppointmentValidation>>({
    resolver: zodResolver(AppointmentValidation),
    defaultValues: {
      primaryPhysician: appointment ? appointment.primaryPhysician : "",
      schedule: appointment
        ? new Date(appointment?.schedule)
        : new Date(Date.now()),
      reason: appointment ? appointment.reason : "",
      note: appointment ? appointment.note : "",
      // cancellationReason: appointment ? appointment.cancellationReason : "",
      // cancellationReason: appointment
      //   ? (appointment.cancellationReason ?? "")
      //   : "",
      cancellationReason: appointment?.cancellationReason || "",
    },
  });

  //  async function onSubmit(values: z.infer<typeof AppointmentValidation>) {
  //     setIsLoading(true);

  //     let status;
  //     switch (type) {
  //         case 'schedule':
  //             status = 'scheduled';
  //             break;
  //         case 'cancel':
  //             status = 'cancelled';
  //             break;

  //         default:
  //             status = 'pending';
  //             break;
  //     }

  //     console.log('BEFORE THE TYPE', type)

  //     try {
  //       if (type === 'create' && patientId) {
  //         console.log('IM here')
  //         const appointmentData = {
  //          userId,
  //          patient: patientId,
  //          primaryPhysician: values.primaryPhysician,
  //          schedule: new Date(values.schedule),
  //          reason: values.reason!,
  //          note: values.note,
  //          status: status as Status,
  //         }
  //         const appointment = await createAppointment(appointmentData)

  //         if (appointment) {
  //             form.reset();

  //             // router.push(`/patients/${userId}/new-appointments/success?appointmentId=${appointment.$id}`)
  //             const successUrl = `/patients/${userId}/new-appointments/success?appointmentId=${appointment.$id}`;
  //             console.log(successUrl);  // Added console log to debug the URL
  //             router.push(successUrl);
  //         }

  //       }  else {
  //         const appointmentToUpdate =
  //         userId,
  //         appointmentId: appointment?.$id!,
  //         appointment: {
  //           primaryPhysician: values?.primaryPhysician,
  //           schedule: new Date(values?.schedule),
  //          status: status as Status,
  //          cancellationReason: values?.cancellationReason
  //         },
  //         type
  //       }

  //       const updatedAppointment = await updateAppointment(appointmentToUpdate);
  //       }

  //      catch (error) {
  //       console.log(error);
  //     }
  //   }

  async function onSubmit(values: z.infer<typeof AppointmentValidation>) {
    console.log("I M submitting", { type });

    setIsLoading(true);

    let status;
    switch (type) {
      case "schedule":
        status = "scheduled";
        break;
      case "cancel":
        status = "cancelled";
        break;
      default:
        status = "pending";
        break;
    }

    console.log("BEFORE THE TYPE", type);

    try {
      if (type === "create" && patientId) {
        console.log("IM here");
        const appointmentData = {
          userId,
          patient: patientId,
          primaryPhysician: values.primaryPhysician,
          schedule: new Date(values.schedule),
          reason: values.reason!,
          note: values.note,
          status: status as Status,
        };
        const appointment = await createAppointment(appointmentData);

        if (appointment) {
          form.reset();
          // router.push(`/patients/${userId}/new-appointments/success?appointmentId=${appointment.$id}`)
          const successUrl = `/patients/${userId}/new-appointments/success?appointmentId=${appointment.$id}`;
          console.log(successUrl); // Added console log to debug the URL
          router.push(successUrl);
        }
      } else {
        console.log("updatingForm");
        const appointmentToUpdate = {
          userId,
          appointmentId: appointment?.$id!,
          appointment: {
            primaryPhysician: values?.primaryPhysician,
            schedule: new Date(values?.schedule),
            status: status as Status,
            cancellationReason: values?.cancellationReason,
          },
          type,
        };

        const updatedAppointment = await updateAppointment(appointmentToUpdate);

        if (updatedAppointment) {
          setOpen && setOpen(false);
          form.reset();
          // const successUrl = `/patients/${userId}/appointments/success?appointmentId=${updatedAppointment.$id}`;
          // console.log(successUrl);  // Added console log to debug the URL
          // router.push(successUrl);
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }

  let buttonLabel;
  switch (type) {
    case "cancel":
      buttonLabel = "Cancel Appointment";
      break;

    case "create":
      buttonLabel = "Request Appointment";
      break;

    case "schedule":
      buttonLabel = "Schedule Appointment";
      break;
    default:
      break;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 space-y-6">
        {type === "create" && (
          <section className="mb-12 space-y-4">
            <h1 className="header">New Appointment</h1>
            <p className="text-dark-700">
              Request a new appointment in 10 seconds
            </p>
          </section>
        )}

        {type !== "cancel" && (
          <>
            <CustomFormField
              fieldType={FormFieldType.SELECT}
              control={form.control}
              name="primaryPhysician"
              label="Doctor"
              placeholder="Select a doctor"
            >
              {Doctors.map((doctor, i) => (
                <SelectItem key={doctor.name + i} value={doctor.name}>
                  <div className="flex cursor-pointer items-center gap-2">
                    <Image
                      src={doctor.image}
                      width={32}
                      height={32}
                      alt="doctor"
                      className="rounded-full border border-dark-500"
                    />
                    <p>{doctor.name}</p>
                  </div>
                </SelectItem>
              ))}
            </CustomFormField>

            <CustomFormField
              fieldType={FormFieldType.DATE_PICKER}
              control={form.control}
              name="schedule"
              label="Excepted appointment data"
              showTimeSelect
              dateFormat="MM/dd/yyyy - h:mm aa"
            />

            <div className="flex flex-col gap-6 xl:flex-row">
              <CustomFormField
                fieldType={FormFieldType.TEXTAREA}
                control={form.control}
                name="reason"
                label="Reason for appointment"
                placeholder="Reason for appointment"
              />

              <CustomFormField
                fieldType={FormFieldType.TEXTAREA}
                control={form.control}
                name="note"
                label="Notes"
                placeholder="Enter notes"
              />
            </div>
          </>
        )}

        {type === "cancel" && (
          <CustomFormField
            fieldType={FormFieldType.TEXTAREA}
            control={form.control}
            name="cancellationReason"
            label="Reason for appointment"
            placeholder="Enter reason for cancellation"
          />
        )}

        <SubmitButton
          isLoading={isLoading}
          className={`${type === "cancel" ? "shad-danger-btn" : "shad-primary-btn"} w-full`}
        >
          {buttonLabel}
        </SubmitButton>
      </form>
    </Form>
  );
};

export default AppointmentForm;
