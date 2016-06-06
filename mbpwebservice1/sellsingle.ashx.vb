Imports System.Web
Imports System.Web.Services
Imports System.Web.Script.Serialization

Public Class sellsingle
    Implements System.Web.IHttpHandler

    Sub ProcessRequest(ByVal context As HttpContext) Implements IHttpHandler.ProcessRequest



        Dim html As New XElement("html")
        Dim body As New XElement("body")
        Dim head = <head>
                       <link rel="stylesheet" type="text/css" href="style.css"></link>
                   </head>



        With context

            If .Request.QueryString("prod") Is Nothing Or .Request.QueryString("client") Is Nothing Then
                'Handle error
                .Response.Write("Es necesario especificar un precio y un producto")
            Else

                Try

                    'Make sell 
                    Dim prod As String = .Request.QueryString("prod")
                    Dim client As String = .Request.QueryString("client")

                    Dim db As New mbpDataContext
                    'Dim db2 As New mbp 

                    Dim p = db.prods.SingleOrDefault(Function(_p) _p.ARTICULO = prod)
                    Dim c = db.clients.SingleOrDefault(Function(_c) _c.CLIENTE = client)


                    Dim vtaId As Integer = GetID("ventas", db)
                    Dim partVtaId As Integer = GetID("partvta", db)
                    Dim noRef As Integer = GetMax("ventas", "no_referen", db)

                    '.Response.Write("id venta:" & vtaId & "<br/>") 
                    body.Add(<div class="status">id venta: <%= vtaId %></div>)
                    body.Add(<div class="status">Partida de venta: <%= partVtaId %></div>)
                    body.Add(<div class="status">No referencia: <%= noRef %></div>)


                    '.Response.Write(" p venta:" & partVtaId & "<br/>")
                    '.Response.Write("no refer:" & noRef & "<br/>")

                    Dim v As New venta With {
                        .ALMACEN = 1,
                        .VENTA = vtaId,
                        .PRECIO = p.PRECIO1,
                        .CLIENTE = p.COSTO,
                        .USUFECHA = DateTime.Now,
                        .IMPORTE = p.PRECIO1,
                        .sucremota = "Local",
                        .businessintelligence = 0,
                        .cambioDeEstado = 0,
                        .Ticket = 1,
                        .CIERRE = 0,
                        .IMPUESTO = 0,
                        .ENFAC = 0,
                        .serieDocumento = "T",
                        .TIPO_DOC = "REM",
                        .NO_REFEREN = noRef
                    }

                    Dim pv As New partvta With {
                         .PRECIO = p.PRECIO1,
                         .ALMACEN = 1,
                         .ARTICULO = p.ARTICULO,
                         .VENTA = v.VENTA,
                         .COSTO = p.COSTO,
                         .CANTIDAD = 1,
                         .DESCUENTO = 0,
                         .IMPUESTO = 0,
                         .ID_SALIDA = partVtaId,
                         .PrecioBase = v.PRECIO,
                         .Devolucion = 0,
                         .DevConf = 0,
                         .ID_entrada = 0,
                         .Invent = 0,
                         .importe = 0,
                         .kit = 0,
                         .costo_u = p.COSTO,
                         .iespecial = 0,
                         .colores = 0,
                         .verificado = 0,
                         .A01 = 0,
                         .serieDocumento = 0
                         }

                    db.ventas.InsertOnSubmit(v)
                    db.partvtas.InsertOnSubmit(pv)
                    db.SubmitChanges()

                    '.Response.Write(String.Format("Venta {0} hecha", vtaId))


                    If context.Request.QueryString("format") IsNot Nothing Then
                        Select Case context.Request.QueryString("format")
                            Case "json"
                                Dim json As New JavaScriptSerializer()
                                Dim ob = New With {.Venta = v, .PartVenta = pv}
                                Dim l = {ob}.ToList()

                                context.Response.Write(json.Serialize(v))



                            Case "html"
                                html.Add(head)
                                html.Add(body)

                                body.Add(<div>Venta <%= vtaId %> hecha</div>)
                                context.Response.Write(html)

                        End Select
                    Else

                    End If


                Catch ex As Exception
                    'body.Add(<div class="error"><%= ex.Message %></div>)
                End Try

            End If





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

End Class