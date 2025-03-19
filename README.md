# M-PESA System

A Django-based application that simulates the M-PESA mobile money service with extended functionality for savings accounts, loans, and agent operations.

## Overview

This system replicates the core functionality of M-PESA - Africa's leading mobile money service - while adding additional features like savings accounts and loans. The application allows users to:

- Create accounts with proper ID verification
- Perform money transfers
- Process deposits and withdrawals through agents
- Manage savings accounts
- Apply for and repay loans
- Pay bills
- Purchase airtime
- Receive transaction notifications

## Models

### User Management

- **User**: Extended Django's AbstractUser with:
  - Kenyan ID number
  - Phone number
  - Date of birth
  - Verification status

- **PhoneLine**: Tracks phone lines registered to national IDs:
  - Enforces the rule of maximum 5 active lines per ID

### Account Management

- **MPesaAccount**: Core account for money transfers:
  - Balance tracking
  - PIN security
  - Activity timestamps

- **SavingsAccount**: Interest-bearing account:
  - Linked to MPesaAccount
  - Transfer functionality to/from M-PESA
  - Next of kin details

### Transaction System

- **Transaction**: Records all financial transactions:
  - Multiple transaction types (deposits, withdrawals, transfers, etc.)
  - Status tracking
  - Fee calculation

- **AgentTransaction**: Special transactions handled by agents:
  - Commission calculations
  - Float management

- **Limit**: System-wide transaction limits:
  - Min/max amount restrictions
  - Daily limit enforcement

- **UserLimit**: Custom limits for specific users

### Agent Network

- **Agent**: Businesses authorized to handle cash transactions:
  - Float balance tracking
  - Commission rates
  - Location information

### Additional Features

- **Bill**: Bill payment processing:
  - Multiple bill types
  - Payment tracking

- **Notification**: User alerts via multiple channels:
  - SMS
  - In-app
  - Email

- **Loan**: Credit facility:
  - Interest calculation
  - Repayment tracking
  - Approval workflow

## Setup and Installation

1. Clone the repository
```bash
git clone <repository-url>
cd mpesa-system
```

2. Create and activate a virtual environment
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies
```bash
pip install -r requirements.txt
```

4. Run migrations
```bash
python manage.py makemigrations
python manage.py migrate
```

5. Create a superuser
```bash
python manage.py createsuperuser
```

6. Run the development server
```bash
python manage.py runserver
```

## Configuration

### Environment Variables

Create a `.env` file in the project root with the following variables:
```
SECRET_KEY=your_secret_key
DEBUG=True
DATABASE_URL=your_database_url
SMS_API_KEY=your_sms_api_key
```

## Usage

### User Registration

Users must provide:
- Valid Kenyan ID number (7-8 digits)
- Phone number in format +254XXXXXXXXX
- Date of birth
- Email
- Username and password

### Agent Registration

Agents must provide:
- Business name
- Business number
- Location
- Commission rate (default 0.5%)

### Transaction Flow

1. **Deposit**: User -> Agent -> MPesaAccount
2. **Withdrawal**: MPesaAccount -> Agent -> User
3. **Transfer**: MPesaAccount -> MPesaAccount
4. **Bill Payment**: MPesaAccount -> Biller
5. **Loan**: System -> MPesaAccount (and reverse for repayment)

## API Endpoints

(Note: This section would be populated with actual API endpoint documentation)

## Security Features

- PIN hashing for transaction authorization
- Validation for Kenyan ID numbers
- Phone number format validation
- Transaction limits
- User verification process

## License

Not licensed

## Contributors

Steve ongera