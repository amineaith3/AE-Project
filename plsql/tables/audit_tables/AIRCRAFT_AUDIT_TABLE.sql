CREATE TABLE aircraft_audit (
    audit_id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    action VARCHAR2(10) NOT NULL,          -- 'INSERT', 'UPDATE', 'DELETE'
    aircraft_id NUMBER NOT NULL,           -- ID of the affected aircraft
    action_date DATE DEFAULT SYSDATE       -- timestamp of the action
);
