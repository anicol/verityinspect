# Generated migration for upload model updates

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('uploads', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='upload',
            name='original_filename',
            field=models.CharField(default='unknown.mp4', help_text='Original uploaded filename', max_length=255),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='upload',
            name='file_type',
            field=models.CharField(default='video/mp4', help_text='MIME type of the file', max_length=100),
        ),
        migrations.AddField(
            model_name='upload',
            name='upload_url',
            field=models.URLField(blank=True, help_text='Presigned upload URL', max_length=2000),
        ),
        migrations.AddField(
            model_name='upload',
            name='updated_at',
            field=models.DateTimeField(auto_now=True),
        ),
    ]