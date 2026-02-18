# Expense Splitter App - Use Case Diagram

```mermaid
useCaseDiagram
    actor "User" as U
    actor "Admin" as A

    package "Full Stack Application" {
        usecase "Register/Login" as UC1
        
        package "User Management" {
            usecase "View Profile" as UC2
            usecase "View Expense History" as UC3
            usecase "Manage Friends" as UC4
        }

        package "Group Management" {
            usecase "Create Group" as UC5
            usecase "Add Member to Group" as UC6
            usecase "View Group Summary" as UC7
        }

        package "Expense Management" {
            usecase "Add Expense" as UC8
            usecase "Split Expense (Equal/Unequal/%)" as UC9
            usecase "Settle Balance" as UC10
            usecase "View Dashboard" as UC11
        }
        
        package "Admin Features" {
            usecase "View All Users" as UC12
            usecase "View All Groups" as UC13
            usecase "Monitor System" as UC14
        }
    }

    U --> UC1
    U --> UC2
    U --> UC3
    U --> UC4
    U --> UC5
    U --> UC6
    U --> UC7
    U --> UC8
    U --> UC10
    U --> UC11

    UC8 ..> UC9 : <<include>>

    A --> UC1
    A --> UC12
    A --> UC13
    A --> UC14
```
