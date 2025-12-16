CREATE OR REPLACE PROCEDURE update_states IS
BEGIN
    -- Aircrafts en vol → In Service
    UPDATE AIRCRAFTS a
    SET State = 'In Service'
    WHERE EXISTS (
        SELECT 1 FROM FLIGHTS f
        WHERE f.AvionID = a.AvionID
          AND SYSDATE BETWEEN f.DepartureTime AND f.Arrival_Time
    );

    -- Aircrafts maintenance → In Progress
    UPDATE AIRCRAFTS a
    SET State = 'Maintenance'
    WHERE EXISTS (
        SELECT 1 FROM MAINTENANCE m
        WHERE m.AvionID = a.AvionID
          AND m.OperationDate = TRUNC(SYSDATE)
    );

    -- Flights → In Service
    UPDATE FLIGHTS
    SET State = 'In Service'
    WHERE DepartureTime <= SYSDATE
      AND Arrival_Time >= SYSDATE
      AND State = 'Scheduled';

    -- Maintenance → Completed
    UPDATE MAINTENANCE
    SET State = 'Completed'
    WHERE OperationDate < SYSDATE
      AND State <> 'Completed';
END;
/
