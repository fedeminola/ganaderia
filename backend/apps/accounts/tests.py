from django.test import TestCase
from django.contrib.auth.models import Permission
from .models import User, Role

class AccountsModelsTestCase(TestCase):
    def setUp(self):
        self.role = Role.objects.create(name='Test Role')
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='password',
            role=self.role
        )

    def test_role_creation(self):
        self.assertEqual(self.role.name, 'Test Role')

    def test_user_creation(self):
        self.assertEqual(self.user.username, 'testuser')
        self.assertEqual(self.user.email, 'test@example.com')
        self.assertTrue(self.user.check_password('password'))
        self.assertEqual(self.user.role, self.role)

    def test_role_permissions(self):
        permission = Permission.objects.create(
            codename='can_view_dashboard',
            name='Can view dashboard',
            content_type_id=1
        )
        self.role.permissions.add(permission)
        self.assertIn(permission, self.role.permissions.all())