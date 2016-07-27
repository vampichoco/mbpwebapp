Imports System.Web
Imports System.Web.Services
Imports Newtonsoft.Json
Imports Newtonsoft.Json.Linq
Imports System.Web.Script.Serialization


Public Class makesell
    Implements System.Web.IHttpHandler

    Sub ProcessRequest(ByVal context As HttpContext) Implements IHttpHandler.ProcessRequest



        With context


            'Try
            Dim db As New mbpDataContext

            .Request.InputStream.Seek(0, 0)

            '.Response.Write(.Request.InputStream.Length)
            Dim rl As Integer = context.Request.InputStream.Length
            Debug.Write(rl)
            Dim reader As New System.IO.StreamReader(context.Request.InputStream)
            Dim inputString As String =
                reader.ReadToEnd()

            Dim j As JObject = JObject.Parse(inputString)

            Dim vtaId As Integer = GetID("ventas", db)
            Dim partVtaId As Integer = GetID("partvta", db)
            'Dim noRef As Integer = GetMax("consec", "ventapendiente", db)
            Dim noRef As Integer = getNoRef("ventapendiente", db)

            'Dim pid As String = j("IdVenta").ToString()
            Dim cid As String = j("ClientId").ToString()
            Dim vend As String = j("Vendedor").ToString()



            Dim c = db.clients.SingleOrDefault(Function(_c) _c.CLIENTE = cid)

            Dim pvArr = j("Partidas").ToArray()

            Dim count As Integer = 0
            Dim tc As Integer = 0

            Dim total As Single = 0.0
            Dim impuestoTotal As Single = 0.0

            For tc = 0 To pvArr.Count - 1
                Dim data = pvArr(tc)

                Dim cantidad As Single = Single.Parse(data("Cantidad").ToString)
                Dim precioU As Single = Single.Parse(data("Precio").ToString)
                Dim impuesto As Single = Single.Parse(data("Impuesto").ToString)

                impuesto = impuesto / 100

                Dim precio As Double = precioU * cantidad
                impuestoTotal = impuestoTotal + ((precioU * cantidad) * impuesto)

                total = total + precio
            Next

            Dim v As New venta With {
                            .ALMACEN = 1,
                            .VENTA = vtaId,
                            .PRECIO = total,
                            .CLIENTE = c.CLIENTE,
                            .USUFECHA = DateTime.Now,
                            .IMPORTE = total,
                            .sucremota = "Local",
                            .businessintelligence = 0,
                            .cambioDeEstado = 0,
                            .Ticket = 1,
                            .CIERRE = 0,
                            .IMPUESTO = impuestoTotal,
                            .ENFAC = 0,
                            .serieDocumento = "T",
                            .TIPO_DOC = "PE",
                            .NO_REFEREN = noRef,
                            .VEND = vend
                        }

            db.ventas.InsertOnSubmit(v)


            For count = 0 To pvArr.Count - 1
                Dim data = pvArr(count)
                Dim pvid = partVtaId + count

                Dim precioU As Single = Single.Parse(data("Precio"))
                Dim cantidad As Single = Single.Parse(data("Cantidad"))
                Dim impuesto As Single = Single.Parse(data("Impuesto"))

                impuesto = impuesto / 100

                Dim artStr As String = (data("Articulo")).ToString()

                Dim precio As Double = precioU * cantidad
                Console.WriteLine(precio)

                precio = precio + (precio * impuesto)

                Dim p = db.prods.SingleOrDefault(Function(_p) _p.ARTICULO = artStr)

                Console.WriteLine(precio)




                Dim pv As New partvta With {
                             .PRECIO = precio,
                             .ALMACEN = 1,
                             .ARTICULO = p.ARTICULO,
                             .VENTA = v.VENTA,
                             .COSTO = p.COSTO * cantidad,
                             .CANTIDAD = cantidad,
                             .DESCUENTO = 0,
                             .IMPUESTO = (precio * impuesto) * cantidad,
                             .ID_SALIDA = pvid,
                             .PrecioBase = precioU,
                             .Devolucion = 0,
                             .DevConf = 0,
                             .ID_entrada = 0,
                             .Invent = 0,
                             .importe = (precio * cantidad),
                             .kit = 0,
                             .costo_u = p.COSTO,
                             .iespecial = 0,
                             .colores = 0,
                             .verificado = 0,
                             .A01 = 0,
                             .serieDocumento = 0
                             }

                db.partvtas.InsertOnSubmit(pv)

            Next




            .Response.StatusCode = 200
            Dim json As New JavaScriptSerializer()

            .Response.Write(json.Serialize(v))

            db.SubmitChanges()
            'Catch ex As Exception
            '    .Response.StatusCode = 500
            'End Try



        End With


    End Sub

    ReadOnly Property IsReusable() As Boolean Implements IHttpHandler.IsReusable
        Get
            Return False
        End Get
    End Property

    Public Function GetID(ByVal Table As String, db As mbpDataContext) As Integer
        Dim cmdStr As String = String.Format("SELECT IDENT_CURRENT('{0}')", Table)
        Dim cmd = Convert.ToInt32(db.ExecuteQuery(Of Decimal)(cmdStr, New Object() {}).FirstOrDefault)
        Dim id As Integer = cmd + 1

        Return id

    End Function

    Public Function GetMax(ByVal Table As String, row As String, db As mbpDataContext) As Integer
        Dim cmdStr As String = String.Format("select Max({1}) as Consec from {0}", Table, row)
        Dim cmd = Convert.ToInt32(db.ExecuteQuery(Of Integer)(cmdStr, New Object() {}).FirstOrDefault)
        Dim id As Integer = cmd + 1

        Return id

    End Function

    Public Function getNoRef(ByVal scope As String, db As mbpDataContext) As Integer
        Dim dato = db.consecs.Single(Function(c) c.Dato = scope)
        Dim consec = dato.Consec
        dato.Consec += 1
        db.SubmitChanges()
        Return consec
    End Function

    Public Sub updateNoRef(ByVal scope As String, db As mbpDataContext)
        Dim dato = db.consecs.Single(Function(c) c.Dato = scope)
        dato.Consec += 1
        db.SubmitChanges()

    End Sub

End Class