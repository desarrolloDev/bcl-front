import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NonNullableFormBuilder, Validators } from '@angular/forms';
import { InputComponent } from '../../ui/input/input.component';
import { SelectComponent } from '../../ui/select/select.component';
import { FirestoreService } from '../../services/firestore.service';
import { AuthService } from '../../services/auth.service';
import { ListService } from '../../services/list.service';
import { ModalService } from '../../ui/modal/modal.service';

@Component({
  selector: 'app-create-profesor',
  standalone: true,
  imports: [
    CommonModule,
    InputComponent,
    SelectComponent
  ],
  templateUrl: './create-profesor.component.html',
  styleUrl: './create-profesor.component.scss'
})
export class CreateProfesorComponent {
  private _fb = inject(NonNullableFormBuilder);
  maxlengthTD: number = 8;
  loading: boolean = false;

  constructor(
    private authService: AuthService,
    private fs: FirestoreService,
    public listService: ListService,
    private modalService: ModalService
  ) {}

  public form = this._fb.group({
    nombre: this._fb.control<string>('', [Validators.required]),
    apellido: this._fb.control<string>('', [Validators.required]),
    tipo_documento: this._fb.control<string>('', [Validators.required]),
    nro_documento: this._fb.control<string>('', [Validators.required]),
    celular: this._fb.control<string>('', [Validators.required]),
    correo: this._fb.control<string>('', [Validators.required, Validators.email]),
    contraseña: this._fb.control<string>('', [Validators.required, Validators.minLength(8)]),
    rep_contraseña: this._fb.control<string>('', [Validators.required, Validators.minLength(8)]),
    rol: this._fb.control<string>('', [Validators.required]),
  });

  async registrar() {
    if (this.form.valid) {
      const confirmed = await this.modalService.openConfirmDialog({ 
        titulo: '¿Está seguro de guardar este usuario?',
        mensaje: '',
        type: '',
        load: this.loading,
        msgBtnAceptar: 'Sí, Guardar',
        msgBtCerrar: 'Cancelar'
      }).toPromise();
  
      if (confirmed) {
        const loadingRef = this.modalService.openLoadingDialog('Guardando...');
  
        this.loading = true;

        const { correo, contraseña } = this.form.value;

        this.authService.registrarUsuario(correo!, contraseña!)
        .then(() => {
          this.fs.addUser(this.form.value)
            .then(() => {
              console.log('Usuario registrado y datos guardados!');
              loadingRef.close();
              this.modalService.openResultDialog(true, 'Usuario registrado y datos guardados!');
              this.form.reset();
            }).catch(err => {
              console.error('Error al guardar:', err);
              loadingRef.close();
          });
        })
        .catch(err => {
          console.error('Error al registrar:', err);
          this.modalService.openResultDialog(false, 'Hubo un error');
        });
      }
    } else {
      console.log('Formulario inválido');
    }
  }
}
