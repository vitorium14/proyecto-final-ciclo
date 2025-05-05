export interface PublicReservationSuccessResponse{
    message: string;
    reservationId: number;
    userId: number;
    newUserCreated: boolean;
}