Imports System.Web
Imports System.Web.Services
Imports System.Web.Script.Serialization
Imports System.Linq.Dynamic

Public Class mbpQuery

    Private _queries As Dictionary(Of String, Func(Of prod, Boolean))
    Private _variables As Dictionary(Of String, String)

    Public Sub New()
        _queries = New Dictionary(Of String, Func(Of prod, Boolean))
        _variables = New Dictionary(Of String, String)
    End Sub

    Public Function Query(ByVal queryName As String) As Func(Of prod, Boolean)
        Return _queries(queryName)
    End Function

    Public Sub AddVariable(key As String, Value As String)
        If _variables.ContainsKey(key) Then
            _variables(key) = Value
        Else
            _variables.Add(key, Value)
        End If
    End Sub

    Public Sub Populate()
        _queries.Add("prod",
                    Function(p As prod) As Boolean
                        Dim pStr As String = _variables("p")
                        Return p.ARTICULO = pStr
                    End Function)

        _queries.Add("contains",
                    Function(p As prod) As Boolean
                        Dim arg As String = _variables("c")
                        If p.DESCRIP IsNot Nothing Then
                            Return p.DESCRIP.Contains(arg)
                        Else
                            Return False
                        End If
                    End Function)

        _queries.Add("pgt",
                    Function(p As prod) As Boolean
                        Dim arg As Double = Double.Parse(_variables("pgt"))
                        Return p.PRECIO1 >= arg
                    End Function)
    End Sub

End Class
