from django import forms
from django.core.validators import RegexValidator, MinLengthValidator
from .models import User, MPesaAccount
import datetime

class CustomerRegistrationForm(forms.Form):
    """Form for registering a new M-PESA customer"""
    first_name = forms.CharField(
        max_length=30,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'First Name'})
    )
    last_name = forms.CharField(
        max_length=30,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Last Name'})
    )
    id_number = forms.CharField(
        max_length=8,
        
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'ID Number'})
    )
    phone_number = forms.CharField(
      
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': '+254XXXXXXXXX'})
    )

    email = forms.EmailField(
        max_length=50,
       
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'email'})
    )
    

    date_of_birth = forms.DateField(
        widget=forms.DateInput(attrs={
            'class': 'form-control', 
            'type': 'date',
            'max': datetime.date.today().strftime('%Y-%m-%d')
        })
    )
    
    def clean_date_of_birth(self):
        dob = self.cleaned_data['date_of_birth']
        today = datetime.date.today()
        age = today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))
        
        if age < 18:
            raise forms.ValidationError("Customer must be at least 18 years old.")
        
        return dob

class MPesaAccountCreationForm(forms.Form):
    """Form for creating a new M-PESA account"""
    pin = forms.CharField(
        max_length=4,
        min_length=4,
        validators=[
            RegexValidator(r'^\d{4}$', 'PIN must be 4 digits.'),
            MinLengthValidator(4)
        ],
        widget=forms.PasswordInput(attrs={'class': 'form-control', 'placeholder': '4-digit PIN'})
    )
    confirm_pin = forms.CharField(
        max_length=4,
        min_length=4,
        widget=forms.PasswordInput(attrs={'class': 'form-control', 'placeholder': 'Confirm PIN'})
    )
    
    def clean(self):
        cleaned_data = super().clean()
        pin = cleaned_data.get('pin')
        confirm_pin = cleaned_data.get('confirm_pin')
        
        if pin and confirm_pin and pin != confirm_pin:
            raise forms.ValidationError("PINs do not match.")
            
        # Check for sequential or repeating digits
        if pin and (
            pin == '1234' or pin == '4321' or 
            pin == '0000' or pin == '1111' or pin == '2222' or 
            pin == '3333' or pin == '4444' or pin == '5555' or 
            pin == '6666' or pin == '7777' or pin == '8888' or pin == '9999'
        ):
            raise forms.ValidationError("PIN is too weak. Avoid sequential or repeating digits.")
            
        return cleaned_data
    




from django import forms
from decimal import Decimal
from django.core.validators import MinValueValidator

class AgentFloatForm(forms.Form):
    """Form for agent float management"""
    TRANSACTION_CHOICES = [
        ('increase', 'Increase Float'),
        ('decrease', 'Decrease Float'),
    ]
    
    amount = forms.DecimalField(
        max_digits=10, 
        decimal_places=2,
        min_value=Decimal('1.00'),
        widget=forms.NumberInput(attrs={
            'class': 'form-control',
            'placeholder': 'Amount (KES)',
            'step': '0.01'
        })
    )
    transaction_type = forms.ChoiceField(
        choices=TRANSACTION_CHOICES,
        widget=forms.RadioSelect(attrs={
            'class': 'form-check-input'
        })
    )
    
    def clean_amount(self):
        amount = self.cleaned_data['amount']
        # Ensure amount is positive and has at most 2 decimal places
        if amount <= 0:
            raise forms.ValidationError("Amount must be greater than 0")
        
        # Format to 2 decimal places
        return amount.quantize(Decimal('0.01'))

class InitialDepositForm(forms.Form):
    """Form for initial deposit into a new M-PESA account"""
    amount = forms.DecimalField(
        max_digits=10, 
        decimal_places=2,
        min_value=Decimal('50.00'),  # Minimum initial deposit
        widget=forms.NumberInput(attrs={
            'class': 'form-control',
            'placeholder': 'Amount (KES)',
            'step': '0.01'
        })
    )
    
    def clean_amount(self):
        amount = self.cleaned_data['amount']
        
        # Minimum deposit validation 
        if amount < Decimal('50.00'):
            raise forms.ValidationError("Initial deposit must be at least KES 50.00")
        
        # Format to 2 decimal places
        return amount.quantize(Decimal('0.01'))
    


from django import forms

class WithdrawalForm(forms.Form):
    amount = forms.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        label="Amount to Withdraw",
        min_value=50,  # Minimum withdrawal amount
    )


from django import forms
from .models import SavingsAccount

class SavingsAccountForm(forms.ModelForm):
    class Meta:
        model = SavingsAccount
        fields = ['next_of_kin_name', 'next_of_kin_phone', 'next_of_kin_relationship']


from django import forms
from decimal import Decimal
from .models import MPesaAccount

class LoanRequestForm(forms.Form):
    amount = forms.DecimalField(max_digits=10, decimal_places=2, label="Loan Amount")

    def __init__(self, user, *args, **kwargs):
        self.loan_tiers = kwargs.pop("loan_tiers", [])
        super().__init__(*args, **kwargs)
        self.user = user
        self.max_loan = self.get_max_loan()

    def get_max_loan(self):
        try:
            mpesa_account = MPesaAccount.objects.get(user=self.user)
            balance = mpesa_account.balance
        except MPesaAccount.DoesNotExist:
            return 0

        max_loan = 0
        for tier_balance, loan_amount in self.loan_tiers:
            if balance >= tier_balance:
                max_loan = loan_amount

        return max_loan


from django import forms
from django.core.validators import RegexValidator
from django.core.exceptions import ValidationError
from django.contrib.auth.forms import PasswordChangeForm
from django.contrib.auth.hashers import check_password
from .models import User, SavingsAccount, MPesaAccount

# Phone number validator
phone_regex = RegexValidator(
    regex=r'^\+?254\d{9}$',
    message="Phone number must be in the format: '+254XXXXXXXXX'"
)

# Kenyan ID validator
def validate_kenyan_id(value):
    if not (value.isdigit() and (len(value) == 8 or len(value) == 7)):
        raise ValidationError("Kenyan ID must be 7 or 8 digits")

class UserProfileForm(forms.ModelForm):
    """
    Form for updating user profile information
    """
    first_name = forms.CharField(
        max_length=30,
        required=True,
        widget=forms.TextInput(attrs={
            'class': 'form-control',
            'placeholder': 'Enter first name'
        })
    )
    
    last_name = forms.CharField(
        max_length=30,
        required=True,
        widget=forms.TextInput(attrs={
            'class': 'form-control',
            'placeholder': 'Enter last name'
        })
    )
    
    email = forms.EmailField(
        required=True,
        widget=forms.EmailInput(attrs={
            'class': 'form-control',
            'placeholder': 'Enter email address'
        })
    )
    
    phone_number = forms.CharField(
        max_length=13,
        validators=[phone_regex],
        required=False,
        widget=forms.TextInput(attrs={
            'class': 'form-control',
            'placeholder': '+254XXXXXXXXX'
        })
    )
    
    id_number = forms.CharField(
        max_length=8,
        validators=[validate_kenyan_id],
        required=False,
        widget=forms.TextInput(attrs={
            'class': 'form-control',
            'placeholder': 'Enter ID number'
        })
    )
    
    date_of_birth = forms.DateField(
        required=False,
        widget=forms.DateInput(attrs={
            'class': 'form-control',
            'type': 'date'
        })
    )

    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'email', 'phone_number', 'id_number', 'date_of_birth']

    def __init__(self, *args, **kwargs):
        self.user = kwargs.pop('user', None)
        super().__init__(*args, **kwargs)

    def clean_email(self):
        email = self.cleaned_data['email']
        if self.user and User.objects.exclude(id=self.user.id).filter(email=email).exists():
            raise ValidationError("This email is already registered.")
        return email

    def clean_phone_number(self):
        phone_number = self.cleaned_data.get('phone_number')
        if phone_number and self.user:
            if User.objects.exclude(id=self.user.id).filter(phone_number=phone_number).exists():
                raise ValidationError("This phone number is already registered.")
        return phone_number

    def clean_id_number(self):
        id_number = self.cleaned_data.get('id_number')
        if id_number and self.user:
            if User.objects.exclude(id=self.user.id).filter(id_number=id_number).exists():
                raise ValidationError("This ID number is already registered.")
        return id_number

class CustomPasswordChangeForm(PasswordChangeForm):
    """
    Custom password change form with better styling
    """
    old_password = forms.CharField(
        label="Current Password",
        strip=False,
        widget=forms.PasswordInput(attrs={
            'class': 'form-control',
            'placeholder': 'Enter current password',
            'autocomplete': 'current-password'
        }),
    )
    
    new_password1 = forms.CharField(
        label="New Password",
        strip=False,
        widget=forms.PasswordInput(attrs={
            'class': 'form-control',
            'placeholder': 'Enter new password',
            'autocomplete': 'new-password'
        }),
    )
    
    new_password2 = forms.CharField(
        label="Confirm New Password",
        strip=False,
        widget=forms.PasswordInput(attrs={
            'class': 'form-control',
            'placeholder': 'Confirm new password',
            'autocomplete': 'new-password'
        }),
    )

class MPesaPinChangeForm(forms.Form):
    """
    Form for changing M-Pesa PIN
    """
    current_pin = forms.CharField(
        max_length=4,
        min_length=4,
        widget=forms.PasswordInput(attrs={
            'class': 'form-control',
            'placeholder': 'Enter current PIN',
            'maxlength': '4',
            'pattern': '[0-9]{4}',
            'title': 'PIN must be 4 digits'
        }),
        label="Current PIN"
    )
    
    new_pin = forms.CharField(
        max_length=4,
        min_length=4,
        widget=forms.PasswordInput(attrs={
            'class': 'form-control',
            'placeholder': 'Enter new PIN',
            'maxlength': '4',
            'pattern': '[0-9]{4}',
            'title': 'PIN must be 4 digits'
        }),
        label="New PIN"
    )
    
    confirm_new_pin = forms.CharField(
        max_length=4,
        min_length=4,
        widget=forms.PasswordInput(attrs={
            'class': 'form-control',
            'placeholder': 'Confirm new PIN',
            'maxlength': '4',
            'pattern': '[0-9]{4}',
            'title': 'PIN must be 4 digits'
        }),
        label="Confirm New PIN"
    )

    def __init__(self, user, *args, **kwargs):
        self.user = user
        super().__init__(*args, **kwargs)

    def clean_current_pin(self):
        current_pin = self.cleaned_data['current_pin']
        
        if not current_pin.isdigit():
            raise ValidationError("PIN must contain only digits.")
        
        try:
            mpesa_account = self.user.mpesa_account
            if not check_password(current_pin, mpesa_account.pin_hash):
                raise ValidationError("Current PIN is incorrect.")
        except MPesaAccount.DoesNotExist:
            raise ValidationError("No M-Pesa account found.")
        
        return current_pin

    def clean_new_pin(self):
        new_pin = self.cleaned_data['new_pin']
        
        if not new_pin.isdigit():
            raise ValidationError("PIN must contain only digits.")
        
        return new_pin

    def clean(self):
        cleaned_data = super().clean()
        new_pin = cleaned_data.get("new_pin")
        confirm_new_pin = cleaned_data.get("confirm_new_pin")

        if new_pin and confirm_new_pin:
            if new_pin != confirm_new_pin:
                raise ValidationError("New PIN and confirmation PIN do not match.")

        return cleaned_data

class SavingsAccountForm(forms.ModelForm):
    """
    Form for opening a savings account
    """
    RELATIONSHIP_CHOICES = [
        ('', 'Select relationship'),
        ('Parent', 'Parent'),
        ('Sibling', 'Sibling'),
        ('Spouse', 'Spouse'),
        ('Child', 'Child'),
        ('Friend', 'Friend'),
        ('Other', 'Other'),
    ]

    next_of_kin_name = forms.CharField(
        max_length=255,
        required=True,
        widget=forms.TextInput(attrs={
            'class': 'form-control',
            'placeholder': 'Enter next of kin name'
        }),
        label="Next of Kin Name"
    )
    
    next_of_kin_phone = forms.CharField(
        max_length=13,
        validators=[phone_regex],
        required=True,
        widget=forms.TextInput(attrs={
            'class': 'form-control',
            'placeholder': '+254XXXXXXXXX'
        }),
        label="Next of Kin Phone"
    )
    
    next_of_kin_relationship = forms.ChoiceField(
        choices=RELATIONSHIP_CHOICES,
        required=True,
        widget=forms.Select(attrs={
            'class': 'form-control'
        }),
        label="Relationship"
    )

    class Meta:
        model = SavingsAccount
        fields = ['next_of_kin_name', 'next_of_kin_phone', 'next_of_kin_relationship']

    def __init__(self, user, *args, **kwargs):
        self.user = user
        super().__init__(*args, **kwargs)

    def clean(self):
        cleaned_data = super().clean()
        
        # Check if user already has a savings account
        if hasattr(self.user, 'savings_account'):
            raise ValidationError("You already have a savings account.")
        
        # Check if user has M-Pesa account
        try:
            self.user.mpesa_account
        except MPesaAccount.DoesNotExist:
            raise ValidationError("You must have an M-Pesa account before opening a savings account.")
        
        return cleaned_data

class AccountVerificationForm(forms.Form):
    """
    Form for account verification
    """
    verification_code = forms.CharField(
        max_length=6,
        min_length=6,
        widget=forms.TextInput(attrs={
            'class': 'form-control',
            'placeholder': 'Enter 6-digit verification code',
            'maxlength': '6',
            'pattern': '[0-9]{6}',
            'title': 'Verification code must be 6 digits'
        }),
        label="Verification Code"
    )

    def clean_verification_code(self):
        code = self.cleaned_data['verification_code']
        
        if not code.isdigit():
            raise ValidationError("Verification code must contain only digits.")
        
        return code